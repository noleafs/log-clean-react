import CronGenerator from '@/renderer/components/CronGenerator'
import { Card, Space } from 'antd'
import React from 'react'
import FileTable from '@/renderer/components/FileTable'

// 发送消息的
const { ipcRenderer } = window.electron
const Timer: React.FC = () => {

  /**
   * 保存配置
   */
  const saveConfig = (dataSource: any) => {
    const json = {
      timer: '0 * * * * ? *',
      logConfig: dataSource
    }
    // 向主进程发送待存储的数据
    ipcRenderer.send('save-config', json)
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
          <FileTable onSave={saveConfig} />
        </Card>
      </Space>
    </>
  )
}

export default Timer
