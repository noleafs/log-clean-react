import { app, shell, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import schedule from 'node-schedule'
import moment from 'moment'
import { autoUpdater } from 'electron-updater'
import { existsSync } from 'node:fs'

// 定时任务对象实例
let job: schedule.Job

var mainWindow;
function createWindow(): BrowserWindow {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    // icon: path.join(__dirname, './resource/icon.png'),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      contextIsolation: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 关闭窗口时触发
  let tray;
  let isQuitting
  mainWindow.on('close', (event) => {
  //  let childWindow = new BrowserWindow({
  //     width: 400,
  //     height: 150,
  //     title:"退出",
  //     y:mainWindow.getBounds().y+30,
  //     x:mainWindow.getBounds().x + 400,
  //     movable: false, // 静止拖动窗口
  //     minimizable: false, // 隐藏最小化按钮
  //   maximizable: false, // 隐藏最大化按钮
  //   // frame: false,
  //     modal: true,
  //     show: false,
  //     autoHideMenuBar: true,
  //     parent: mainWindow,
  //     resizable: false,
  //     // icon: path.join(__dirname, './resource/icon.png'),
  //     // ...(process.platform === 'linux' ? { icon } : {}),
  //     // webPreferences: {
  //     //   contextIsolation: false,
  //     //   preload: join(__dirname, '../preload/index.js'),
  //     //   sandbox: false
  //     // }
  //   })
  //   childWindow.loadFile(join(__dirname, '../renderer/exitDialog.html'))

  //   childWindow.on('ready-to-show', () => {
  //     childWindow.show()
  //   })
  //   event.preventDefault();

    if (!isQuitting) {
      event.preventDefault();
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['是', '否'],
        cancelId: -1,
        defaultId: 0,
        title: '提示',
        message: '是否最小到系统托盘'
      }).then(result => {
        if (result.response === 0) {
            mainWindow.hide();
            if (!tray) {
              const icon = nativeImage.createFromDataURL('data:image/png;base64,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')
              tray = new Tray(icon); // 提供托盘图标路径
              const contextMenu = Menu.buildFromTemplate([
                {
                  label: '显示主窗口',
                  click: () => {
                    mainWindow.show();
                  }
                },
                {label: '退出',
                  click: () => {
                    isQuitting = true;
                    app.quit();
                  }
                }
              ]);
              tray.setToolTip('log-clean');
              tray.setContextMenu(contextMenu);
              tray.on('click', () => {
                mainWindow.show();
              });
            }
          
        } else if(result.response === 1) {
          isQuitting = true;
          mainWindow = null;
          app.quit();
        }
      });
    }
  });

  // mainWindow.webContents.openDevTools()

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('message', (_event, arg) => {
    // 收到发送过来的消息后，去读取对应文件夹下的文件，配置文件的地址为
    const param = JSON.parse(arg)
    console.log(param)
    // traverseFolder(arg)
    // event.sender.send('renderer-message', '2323423')
  })

  /**
   * 获取版本号
   */
  ipcMain.on('get-version', () => {
    mainWindow.webContents.send('version_result', app.getVersion())
  })

  /**
   * 存储软件运行中的其它东西。例如运行记录等
   * @param store传入需要存储的k v,以对象形式
   */
  ipcMain.on('save-store', (_event, store) => {
    saveStore(store)
  })


  /**
   * 读取运行结果
   */
  ipcMain.on('read-resultTime', (_event) => {
    let data: any;
    const filePath = path.join(app.getPath('userData'), 'log-clean-store.json')
    // console.log("store.json", filePath)
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch (err) {
      // if (err instanceof Error) {}
      // if (err.code === 'ENOENT') {
        // console.log("文件不存在")
        data = { resultTime: [] };
      // } else {
        // console.log(" read-resultTime 读取运行记录出错")
      // }
    } finally {
      mainWindow.webContents.send('read-resultTime-result', data.resultTime == undefined ? [] : data.resultTime)
    }
  })


  // 接收渲染进程发送的存储配置信息的消息
  ipcMain.on('save-config', (_event, config) => {
    const result = saveConfig(config)
    // 将写入结果回传给渲染进程
    mainWindow.webContents.send('save_result', result)
  })


  // 接收渲染进程发送的获取配置
  ipcMain.on('config-loaded', (_event, _config) => {
    // 读取配置信息并发送到渲染进程
    const param = loadConfig()
    mainWindow.webContents.send('config-loaded', param)
  })

  const mainWindow = createWindow()
  // 读取配置文件中的内容
  let config = loadConfig()
  job = schedule.scheduleJob(config.timer, scheduleJob(config))


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  if (job) {
    job.cancel()
  }
})


// 构建配置自动更新
app.on('ready', () => {

  // 禁止自动更新，以便用户控制下载时机
  autoUpdater.autoDownload = false
  // 检查更新
  autoUpdater.checkForUpdatesAndNotify()

  // 当发现新版本
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: '发现新版本，是否立即下载更新？',
      buttons: ['是', '否']
    }).then((result) => {
      if (result.response === 0) {
        // 下载更新
        autoUpdater.downloadUpdate()
      }
    })
  })
  // 当更新下载完成
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '更新下载完成',
      message: '更新下载完成，是否立即安装并重启？',
      buttons: ['是', '否']
    }).then((result) => {
      if (result.response === 0) {
        // 安装并重启
        autoUpdater.quitAndInstall()
      }
    })
  })

})

/**
 * 定义一个函数用于遍历文件夹，并比较其创建时间，判定存留的时间
 * @param originalFolder 源文件夹（不能被删除）
 * @param folderPath 文件夹路径
 * @param containsSubFolder 包含子文件夹
 * @param saveTime 存留时间， 这个时间之前的都将删除
 */
function traverseFolder(originalFolder: string, folderPath: string, containsSubFolder = true, saveTime: Date): void {
  // 读取文件夹下所有文件
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('读取文件夹失败:', err)
      return
    }
    // 这里需要判定不能包含第一次进来时配置的文件夹路径
    if (files.length === 0 && folderPath !== originalFolder && existsSync(folderPath)) {
      fs.rmdir(folderPath, (err) => {
        if (err) {
          console.error(err)
        }
      })
      return
    }
    // 遍历文件数组
    files.forEach((file) => {
      const filePath = path.join(folderPath, file)
      // 获取文件状态
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err)
          return
        }
        if (stats.isDirectory() && containsSubFolder) {
          // 如果是文件夹，则递归遍历文件夹
          traverseFolder(originalFolder, filePath, containsSubFolder, saveTime)
        } else {
          // 如果是文件，则获取文件创建日期和文件名称， 通过创建时间计算比如说好多天之前的文件进行删除
          const createDate = stats.birthtime
          // 这里调用删除文件(判定了文件的创建时间在配置的时间之前的就进行删除操作)
          if (createDate < saveTime) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log('删除文件失败，路径', filePath, '失败原因：', err)
                return
              }
              // 删除文件后，判定当前文件夹是否是空文件夹而且需要判断文件夹存在
              if (existsSync(folderPath) && isFolderEmpty(folderPath) && folderPath !== originalFolder) {
                fs.rmdir(folderPath, (err) => {
                  if (err) {
                    console.error(err)
                  }
                })
              }
            })
          }
        }
      })
    })
  })
}

// 定义一个函数，将日期转换为指定格式的字符串
// @ts-ignore
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  // 返回格式化后的字符串
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 定义一个函数，用于判断文件夹是否为空
function isFolderEmpty(folderPath: string): boolean {
  // 读取文件夹下所有文件
  const files = fs.readdirSync(folderPath)

  // 如果文件数组的长度为 0，则文件夹为空
  return files.length === 0
}


/**
 * 保存数据到文件中
 */
function saveStore(store) {
  let data;
  const filePath = path.join(app.getPath('userData'), 'log-clean-store.json')
  try {
    data = fs.readFileSync(filePath, 'utf-8')
    data = JSON.parse(data);
  } catch (error) {
    // if (error.code === 'ENOENT') {

    // }
    data = {};
  } finally {
    // 此句不能删除，文件可能会被人为清空，不判断会导致出问题
    if (data == null || data.length == 0) {
      data = {};
    }
    const result = Object.assign(data, store);
    fs.writeFileSync(filePath, JSON.stringify(result), 'utf-8')
    return result;
  }
}

let result;
/**
 * 保存日志运行记录，并发送消息给渲染进程
 * @param store 
 */
function saveResultTime(store) {
  // 首次需要从文件中读取记录
  if (result == undefined) {
    const filePath = path.join(app.getPath('userData'), 'log-clean-store.json')
    try {
      result = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch (err) {
      result = { resultTime: [] }
    }
    if (result == undefined || result.length == 0 || result.resultTime == undefined) {
      result = saveStore(store);
    }
  }

  if (result != undefined && result != null && result.resultTime != undefined) {
    let resultTime = result.resultTime;
    // console.log("resultTime:",resultTime)
    if (resultTime.length >= 5) {
      resultTime.shift();
      // console.log("newArr", newArr)
      result.resultTime = resultTime;
    }
    result.resultTime.push(store.resultTime[0]);
    result = saveStore({ resultTime: result.resultTime });
  }

  // console.log("发送", result.resultTime, result)
  mainWindow.webContents.send('read-resultTime-result', result.resultTime)
}



/**
 * 保存配置信息到文件
 * @param config
 */
function saveConfig(config: any): any {
  const configPath = path.join(app.getPath('userData'), 'config.json')
  try {
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
    // 重新开始新的定时任务
    if (job) {
      job.cancel()
    }
    console.log('开启新任务', config.timer)
    // 重新开启任务
    job = schedule.scheduleJob(config.timer, scheduleJob(config))
    return { success: true }
  } catch (err) {
    return { success: false, err }
  }
}

/**
 * 从配置文件读取配置信息
 */
function loadConfig() {
  const configPath = path.join(app.getPath('userData'), 'config.json')
  try {

    const data = fs.readFileSync(configPath, 'utf-8')

    return JSON.parse(data)
  } catch (error) {
    // 生成一个默认的配置文件
    const defaultConfig = {
      timer: '  1 * * *',
      logConfig: [
        {
          key: '0',
          logPath: '/home/jt/log',
          saveTime: '1',
          // 默认当前时间
          datetime: moment().format('YYYY-MM-DD'),
          containDir: true
        }
      ]
    }
    saveConfig(defaultConfig)
    return defaultConfig
  }
}


/**
 * 待执行的任务
 * @param config
 */
function scheduleJob(config: any) {
  return () => {
    // console.log('执行了一次定时任务，执行时间是：', formatDate(new Date()))
    saveResultTime({ resultTime: [formatDate(new Date())] })
    if (config && config.timer && config.logConfig && config.logConfig.length > 0) {
      // 需要执行的定时任务，根据配置删除指定文件夹下的内容
      for (let i = 0, len = config.logConfig.length; i < len; i++) {
        const cfg = config.logConfig[i]
        // 获取配置的日志路径、保留时长、时间、是否包含子文件夹
        const { logPath, datetime, containDir } = cfg
        // 需要将时间进行转换
        const time = new Date(datetime)
        traverseFolder(logPath, logPath, containDir, time)

      }
    }
  }
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
