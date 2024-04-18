import CronGenerator from '@/renderer/components/CronGenerator'
import { Card, Space } from 'antd'
import React from 'react'
import FileTable from '@/renderer/components/FileTable'


const Timer: React.FC = () => {
  return (
    <>
      <Space direction="vertical">
        <Card bordered={false} title="定时计划配置">
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            {/* 定时计划 */}
            <CronGenerator/>
          </Space>
        </Card>
        {/* 日志路径配置 */}
        <Card bordered={false} title="日志路径配置">
          <FileTable />
        </Card>
      </Space>
    </>
  )
}

export default Timer
