import React from 'react'
import { CronProps } from './type'
import { Tabs, Input, TabsProps, Radio, InputNumber, Checkbox, Space } from 'antd'
/**
 * Cron表达式生成器
 * @returns
 */
const CronGenerator: React.FC<CronProps> = (params: CronProps) => {
  /**
   * 生成cron
   * @returns {Promise<void>}
   */
  const creareCron = async () => {}

  /**
   * cron生成器
   * @param type 类型
   */
  const cronGenerator = (type) => {}

  /**
   * 对象生成器
   * @param {string} type
   * @param data
   * @returns { {second: *}|{minute: *}}
   */
  const cronItemGenerator = (type: string, data: any) => {
    switch (type) {
      case 'second':
        return { second: data }
      case 'minute':
        return { minute: data }
      case 'hour':
        return { hour: data }
      case 'day':
        return { day: data }
      case 'month':
        return { month: data }
      case 'week':
        return { week: data }
    }
  }

  /**
   * 生成多选框
   * @param key key
   * @param col 每行个数
   * @param minNum 最小值
   * @param maxNum 最大值
   */
  const createCheckbox = (key: any, col: number, minNum: number, maxNum: number) => {
    return [];
  }

  /**
   * 格式化0-9的数字
   * @param num 数字
   * @returns 格式化后的
   */
  const formatNum = (num: number) => {
    if (num < 10 && num > -1) {
      return '0' + num
    }
    return num
  }

  const handleRadioChange = (e, type) => {}

  const handleCheckboxChange = (checkedValues, type) => {}

  const handlePeriodChange = (e, type, tar) => {}

  const handleLoopChange = (e, type, tar) => {}

  const { TabPane } = Tabs
  const { cronText, radioValue } = params
  const { Search } = Input
  const radioStyle = {
    height: '30px',
    lineHeight: '30px',
    display: 'flex',
    alignItems: 'center'
  }

  const secondCheckBox = createCheckbox('second', 10, 0, 59)
  const minuteCheckbox = createCheckbox('minute', 10, 0, 59)
  const hourCheckbox = createCheckbox('hour', 10, 0, 23)
  const dayCheckbox = createCheckbox('day', 10, 1, 31)
  const monthCheckbox = createCheckbox('month', 10, 1, 12)
  const weekCheckbox = createCheckbox('week', 7, 1, 7)

  // tab
  const items: TabsProps['items'] = [
    {
        key: '1',
        label: '秒',
        children: <Radio.Group onChange={e => handleRadioChange(e, 'second')}>
            <Space direction='vertical' size="middle">
                <Radio style={radioStyle} value={1}>每秒执行</Radio>
                <Radio style={radioStyle} value="period">
                    周期从 <InputNumber min={1} max={59} defaultValue={1}/> - <InputNumber/> 秒
                </Radio>
                <Radio style={radioStyle} value="loop">
                    从 <InputNumber min={1} max={59} defaultValue={1} onChange={e=> handleLoopChange(e, 'second', 'start')}/> 秒开始，每 <InputNumber min={1} max={59} defaultValue={1} onChange={e=> handleLoopChange(e, 'second', 'end')}/> 秒执行一次
                </Radio>
                <Radio style={radioStyle} value="point">
                    指定
                    <Checkbox.Group style={{width: '100%'}} onChange={e => handleCheckboxChange(e, 'second')} options={secondCheckBox}/>
                </Radio>
            </Space>
        </Radio.Group>
    },
    {
        key: '2',
        label: '分',
        children: ''
    }
  ]

  return (
    <>
        <span style={{color: 'red'}}>*</span>
        <label style={ { color: 'rgba(0,0,0,.85)', marginLeft: '5px' }}>时间参数</label>
        <Tabs type='card' style={{height: '300px', marginTop: '6px'}} items={items}/>
    </>
  )
}

export default CronGenerator
