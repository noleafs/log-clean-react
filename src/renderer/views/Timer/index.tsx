import CronGenerator from '@/renderer/components/CronGenerator'
import { Button, Card, InputRef, Space } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
const { ipcRenderer } = window.electron
const Timer: React.FC = () => {
  useEffect(() => {
    ipcRenderer.on('renderer-message', (event, arg) => {
      console.log('渲染进程收到的消息', event, arg)
    })
  }, [])

  const sendMsg = (): void => {
    if (ref.current?.input?.value === '') {
      console.log('文件夹路径不能为空')
      ref.current?.input?.focus()
      return
    }
    ipcRenderer.send('message', ref.current?.input?.value)
    // ipcRenderer.send('message', '/home/ycl/testDelete')
  }

  const ref = useRef<InputRef>(null)

  return (
    <Card bordered={false} title="定时计划配置">
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
        <Button type="primary" onClick={sendMsg}>
          向主进程发送消息
        </Button>

        <CronGenerator/>
      </Space>
    </Card>
  )
}

export default Timer
