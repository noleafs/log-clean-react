import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputRef,
  Radio,
  RadioChangeEvent,
  Row,
  Space
} from 'antd'
import { FileOutlined } from '@ant-design/icons'
import React, { useEffect, useRef, useState } from 'react'
const { RangePicker } = DatePicker
// 渲染进程向主进程发送消息的对象
const { ipcRenderer } = window.electron
const Home: React.FC = () => {
  const ref = useRef<InputRef>(null)
  const [form] = Form.useForm()
  const options = [
    {
      label: '保留15天',
      value: 'save_15'
    },
    {
      label: '保留30天',
      value: 'save_30'
    },
    {
      label: '保留45天',
      value: 'save_45'
    },
    {
      label: '时间区间',
      value: 'range'
    },
    {
      label: '之前',
      value: 'before'
    }
  ]

  const [time, setTime] = useState('range')

  /**
   * 模式切换
   * @param param0 参数
   */
  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setTime(value)
  }

  useEffect(() => {
    // 向主进程发送消息，去读取配置文件里的内容
    ipcRenderer.send('message', JSON.stringify({ command: 'getConfigFile' }))
  }, [])

  /**
   * 存储配置的信息
   */
  const onFinish = (values: any) => {
    console.log(values)
  }

  return (
    <>
      <Card bordered={false} title="清除目标配置">
        <Form
          form={form}
          onFinish={onFinish}
          labelCol={{ span: 4 }}
          initialValues={{ time_spread: time }}
          wrapperCol={{ span: 16 }}
          style={{ paddingTop: '20px' }}
        >
          <Form.Item label="日志路径" name="logPath">
            <Input size="large" autoFocus autoComplete="false" allowClear />
          </Form.Item>

          <Form.Item label="时间段" name="time_spread">
            <Radio.Group size="large" options={options} optionType="button" onChange={onChange} />
          </Form.Item>

          <Form.Item label="时间选择" name="range">
            <RangePicker size="large" />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Space>
              <Button size="large" type="primary" htmlType="submit">
                确定
              </Button>
              <Button size="large" htmlType="reset">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  )
}
export default Home
