import React, { useEffect, useState } from 'react'
import QnnReactCron from 'qnn-react-cron'
import { Button } from 'antd'

/**
 * Cron表达式生成器组件
 * @returns
 */

interface ICronGeneratorProps {
  cronText?: string;
}

const { ipcRenderer } = window.electron

const CronGenerator: React.FC<ICronGeneratorProps> = ({}) => {
  let cronFns: any
  let [value, setValue] = useState<string>('')
  useEffect(() => {
    ipcRenderer.on('config-loaded', (_event, arg) => {
      const timer = arg['timer']
      setValue(timer)
      console.log('渲染进程收到的消息', arg)
    })
    // 向主进程发送消息，请求获取定时计划的配置信息
    ipcRenderer.send('message', JSON.stringify({ command: 'getConfigFile' }))
  }, [])
  return (
    <>
      <div style={{ textAlign: 'center', margin: '0 0 12px 0' }}>Cron表达式： {value}</div>
      <QnnReactCron
        value={value}
        onOk={(value) => {
          console.log('cron:', value)
        }}
        getCronFns={(_cronFns) => {
          cronFns = _cronFns
        }}
        footer={[
          <Button
            key="cencel"
            style={{ marginRight: 10 }}
            onClick={() => {
              setValue('')
            }}
          >
            重置
          </Button>,
          <Button
            key="getValue"
            type="primary"
            onClick={() => {
              setValue(cronFns.getValue())
            }}
          >
            生成
          </Button>
        ]}
      />
    </>
  )
}

export default CronGenerator
