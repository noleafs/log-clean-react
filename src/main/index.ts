import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import schedule from 'node-schedule'
// 定时任务对象实例
let job: schedule.Job

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    icon,
    // ...(process.platform === 'linux' ? { icon } : {}),
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
  ipcMain.on('message', (event, arg) => {
    // 收到发送过来的消息后，去读取对应文件夹下的文件，配置文件的地址为
    const param = JSON.parse(arg);
    console.log(param)
    // traverseFolder(arg)

    // event.sender.send('renderer-message', '2323423')
  })

  // @ts-ignore
  const mainWindow = createWindow()

  // job = schedule.scheduleJob('0/2 * * * * ?', () => {
  //   console.log('指定定时任务')
  //   mainWindow.webContents.send('renderer-message', '这是主进程发送的消息，执行定时任务')
  // })
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

// 定义一个函数用于遍历文件夹
function traverseFolder(folderPath: string): void {
  // 读取文件夹下所有文件
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err)
      return
    }
    if (files.length === 0) {
      console.log('空文件夹，进行删除，路径为：', folderPath)
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

        if (stats.isDirectory()) {
          // 如果是文件夹，则递归遍历文件夹
          traverseFolder(filePath)
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
            console.log('文件删除成功')
            // 这里调用文件删除，删除文件后，判定当前文件夹是否是空文件夹
            if (isFolderEmpty(folderPath)) {
              console.log('删除当前文件夹，文件夹路径为：', folderPath)
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
