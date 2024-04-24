import { cronTimeEnum, LoopType, PeriodType, PointType, RadioType } from '@/renderer/components/Cron/type'
import React, { forwardRef, useState } from 'react'

const cronType = ['second', 'minute', 'hour', 'day', 'week', 'month'] as cronTimeEnum[]

// 按钮基本样式
const radioStyle = {
  display: 'block',
  lineHeight: 2
}

const Cron = (props: { cronExpression: string }, ref: any) => {
  const { cronExpression } = props
  const [cronText, setCronText] = useState<string>('')
  // 单选按钮执行类型
  const [radioValue, setRadioValue] = useState<RadioType>({
    second: 1,
    minute: 1,
    hour: 1,
    day: 1,
    week: 1,
    month: 1
  })

  // 周期
  const [periodValue, setPeriodValue] = useState<PeriodType>({
    second: { min: 1, max: 2 },
    minute: { min: 1, max: 2 },
    hour: { min: 0, max: 1 },
    day: { min: 1, max: 2 },
    week: { min: 2, max: 3 },
    month: { min: 1, max: 2 }
  })

  // 从……开始
  const [loopValue, setLoopValue] = useState<LoopType>({
    second: { start: 0, end: 1 },
    minute: { start: 0, end: 1 },
    hour: { start: 0, end: 1 },
    day: { start: 1, end: 1 },
    week: { start: 1, end: 1 },
    month: { start: 1, end: 1 }
  })

  // 指定
  const [pointValue, setPointValue] = useState<PointType>({
    second: [],
    minute: [],
    hour: [],
    day: [],
    month: [],
    week: []
  })


  return (
    <></>
  )
}

export default forwardRef(Cron)
