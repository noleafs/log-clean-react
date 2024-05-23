import { Card, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import FileTable from '@/renderer/components/FileTable'
import Cron from '@/renderer/components/Cron'
// import { time } from 'console'

// 发送消息的
const { ipcRenderer } = window.electron
const Timer: React.FC = () => {

  let [value, setValue] = useState<string>('')
  let [datasource, setDataSource] = useState<any[]>([])
  useEffect(() => {
    ipcRenderer.removeAllListeners('config-loaded')
    ipcRenderer.on('config-loaded', (_event, arg) => {
      let timer = arg['timer']
      const logConfig = arg['logConfig']
      setValue(timer)
      setDataSource(logConfig)
    })
    // 向主进程发送消息，请求获取定时计划的配置信息
    ipcRenderer.send('config-loaded', JSON.stringify({ command: 'getConfigFile' }))
    // 发送运行结果
    ipcRenderer.send('read-resultTime')
  }, [])


  /**
   * 保存配置
   */
  const saveConfig = (dataSource: any) => {
    const json = {
      timer: value,
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
            <Cron cronExpression={value} setCronExpression={setValue}></Cron>
          </Space>
        </Card>
        {/* 日志路径配置 */}
        <Card bordered={false} title="日志路径配置">
          <FileTable onSave={saveConfig} datasource={datasource} setDatasource={setDataSource} />
        </Card>
      </Space>
    </>
  )
}

export default Timer
