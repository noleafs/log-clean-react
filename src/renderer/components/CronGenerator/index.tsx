import React, { useState } from 'react'
import QnnReactCron from 'qnn-react-cron'
import { Button } from 'antd'
/**
 * Cron表达式生成器组件
 * @returns
 */
const CronGenerator: React.FC = () => {
  let cronFns
  let [value, setValue] = useState<string>('0,20,14,26 * * * * ? *')

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
