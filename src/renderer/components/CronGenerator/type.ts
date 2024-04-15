export type CronProps = {
  cronText?: string
  cronType: ['second', 'minute', 'hour', 'day', 'month', 'week']
  radioValue: {
    second: 1
    minute: 1
    hour: 1
    day: 1
    month: 1
    week: 1
  }
  periodValue: {
    second: { max: 1; min: 1 }
    minute: { max: 1; min: 1 }
    hour: { max: 1; min: 1 }
    day: { max: 1; min: 1 }
    month: { max: 1; min: 1 }
    week: { max: 1; min: 1 }
  }
  loopValue: {
    second: { start: 1; end: 1 }
    minute: { start: 1; end: 1 }
    hour: { start: 1; end: 1 }
    day: { start: 1; end: 1 }
    month: { start: 1; end: 1 }
    week: { start: 1; end: 1 }
  }
  cron: {
    second: '*'
    minute: '*'
    hour: '*'
    day: '*'
    month: '*'
    week: '*'
  }
  cronParams: {
    second: '*'
    minute: '*'
    hour: '*'
    day: '*'
    month: '*'
    week: '*'
  }
}
