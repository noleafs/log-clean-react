import { Button, DatePicker, Input, InputRef, Modal } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
const { ipcRenderer } = window.electron
const App: React.FC = () => {
  useEffect(() => {
    ipcRenderer.on('renderer-message', (event, arg) => {
      console.log('渲染进程收到的消息', event, arg)
    })
  }, [])
  const [open, setOpen] = useState<boolean>(false)

  const sendMsg = (): void => {
    if (ref.current?.input?.value === '') {
      console.log('文件夹路径不能为空')
      return
    }
    ipcRenderer.send('message', ref.current?.input?.value)
    // ipcRenderer.send('message', '/home/ycl/testDelete')
  }

  const ref = useRef<InputRef>(null)

  return (
    <>
      <div className="app">日志清理工具</div>
      <Input addonBefore={<span>文件夹路径</span>} ref={ref} />
      <br />
      <div> 这是一个时间控件</div>
      <DatePicker />
      <br />
      <Button type="primary" onClick={sendMsg}>
        向主进程发送消息
      </Button>
      <br />
      <Button type="primary" onClick={() => setOpen(true)}>
        修改配置
      </Button>
      <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)}>
        这是一个弹窗
      </Modal>
    </>
  )
}

export default App
