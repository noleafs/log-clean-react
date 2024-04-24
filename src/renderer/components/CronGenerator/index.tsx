import React from 'react'
import QnnReactCron from 'qnn-react-cron'
import { Button } from 'antd'

/**
 * Cron表达式生成器组件
 * @returns
 */

interface ICronGeneratorProps {
  cronText?: string;
  setCronText: (text: string) => void;
}

const CronGenerator: React.FC<ICronGeneratorProps> = (props) => {
  let cronFns: any
  const { cronText, setCronText } = props
  return (
    <>
      <div style={{ textAlign: 'center', margin: '0 0 12px 0' }}>Cron表达式： {cronText}，每天晚上0点执行一次</div>
      <QnnReactCron
        disabled
        value={cronText}
        onOk={(value) => {
          console.log('cron:', value)
        }}
        getCronFns={(_cronFns) => {
          cronFns = _cronFns
        }}
        defaultTab={'hour'}
        panesShow={{
          second: true,
          minute: true,
          hour: true,
          day: true,
          month: true,
          week: false,
          year: false
        }}
        footer={[
          <Button
            key="cencel"
            style={{ marginRight: 10 }}
            onClick={() => {
              setCronText('')
            }}
          >
            重置
          </Button>,
          <Button
            key="getValue"
            type="primary"
            onClick={() => {
              setCronText(cronFns.getValue())
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
