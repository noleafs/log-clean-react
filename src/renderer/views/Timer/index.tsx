import CronGenerator from '@/renderer/components/CronGenerator'
import { Card, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import FileTable from '@/renderer/components/FileTable'

const { ipcRenderer } = window.electron
const Timer: React.FC = () => {
  const [cronText, setCronText] = useState<string>('')

  useEffect(() => {
    ipcRenderer.on('renderer-message', (event, arg) => {
      console.log('渲染进程收到的消息', event, arg)
    })
    // 向主进程发送消息，请求获取定时计划的配置信息
    ipcRenderer.send('message', JSON.stringify({ command: 'getConfigFile' }))
  }, [])

  const sendMsg = (): void => {
    ipcRenderer.send('message', '')
    // ipcRenderer.send('message', '/home/ycl/testDelete')
  }


  return (
    <>
      <Space direction="vertical">
        <Card bordered={false} title="定时计划配置">
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            {/* 定时计划 */}
            <CronGenerator />
          </Space>
        </Card>
        {/* 日志路径配置 */}
        <Card bordered={false} title="日志路径配置">
          <FileTable/>
        </Card>
      </Space>
    </>
  )
}

export default Timer
