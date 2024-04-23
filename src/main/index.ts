import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import schedule from 'node-schedule'
import moment from 'moment'
import { autoUpdater } from 'electron-updater'

// 定时任务对象实例
let job: schedule.Job

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1150,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    // icon: path.join(__dirname, './resource/icon.png'),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      contextIsolation: true,
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

  mainWindow.webContents.openDevTools()

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


  app.on('activate', function() {
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
 * @param folderPath 文件夹路径
 * @param containsSubFolder 包含子文件夹
 * @param saveTime 存留时间
 */
// @ts-ignore
function traverseFolder(folderPath: string, containsSubFolder = true, saveTime: string): void {
  // 读取文件夹下所有文件
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('读取文件夹失败:', err)
      return
    }
    if (files.length === 0) {
      fs.rmdir(folderPath, (err) => {
        if (err) {
          console.error(err)
        }
      })
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
          traverseFolder(filePath, containsSubFolder, saveTime)
        } else {
          // 如果是文件，则获取文件创建日期和文件名称， 通过创建时间计算比如说好多天之前的文件进行删除
          const createDate = stats.birthtime
          console.log('文件路径：', filePath, '文件名:', file, ' 创建时间:', formatDate(createDate))
          // 这里调用删除文件
          console.log('调用删除文件, 文件所处的文件夹是', folderPath)
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log('删除文件失败，路径', filePath, '失败原因：', err)
              return
            }
            // 删除文件后，判定当前文件夹是否是空文件夹
            if (isFolderEmpty(folderPath)) {
              fs.rmdir(folderPath, (err) => {
                if (err) {
                  console.error(err)
                }
              })
            }
          })
        }
      })
    })
  })
}

// 定义一个函数，将日期转换为指定格式的字符串
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
      timer: '? ? 0 * * ? *',
      logConfig: [
        {
          key: '0',
          logPath: '/home/ycl/testDelete',
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
    console.log('执行了一次定时任务，执行时间是：', new Date())
    if (config && config.timer && config.logConfig && config.logConfig.length > 0) {
      // 需要执行的定时任务，根据配置删除指定文件夹下的内容
      for (let i = 0, len = config.logConfig.length; i < len; i++) {
        const cfg = config.logConfig[i]
        // 获取配置的日志路劲、保留时长、时间、是否包含子文件夹
        const { logPath, datetime, containDir } = cfg
        // 需要将时间进行转换
        traverseFolder(logPath, containDir, datetime)

      }
    }
  }
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
