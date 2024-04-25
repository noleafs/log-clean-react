/* 声明cron组件的一些变量、属性类型 */

export interface RadioType {
  second: number | string;
  minute: number | string;
  hour: number | string;
  day: number | string;
  month: number | string;
  week: number | string;
}

// 基础cron 数据类型
export type cronTimeEnum = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week';

// 周期
interface minMaxType {
  min: number;
  max: number;
}

export interface PeriodType {
  second: minMaxType;
  minute: minMaxType;
  hour: minMaxType;
  day: minMaxType;
  month: minMaxType;
  week: minMaxType;
}

// 从……开始
interface startEndType {
  start: number;
  end: number;
}

export interface LoopType {
  second: startEndType;
  minute: startEndType;
  hour: startEndType;
  day: startEndType;
  month: startEndType;
  week: startEndType;
}

// 指定
export interface PointType {
  second: number[];
  minute: number[];
  hour: number[];
  day: number[];
  month: number[];
  week: number[];
}

export type CronProps = {
  cronExpression: string;
  setCronExpression: any
}
