import React, { useContext, useEffect, useRef, useState } from 'react'
import { Checkbox, DatePicker, GetRef, InputRef, Select, Space } from 'antd'
import { Button, Form, Input, Popconfirm, Table } from 'antd'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { antdUtils } from '@/renderer/utils/antd'
import dayjs from 'dayjs'
import moment from 'moment'
// 发送消息的
const { ipcRenderer } = window.electron

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface Item {
  key: string;
  logPath: string;
  saveTime: string;
  datetime?: string;
  containDir: boolean;
}

interface EditableRowProps {
  index: number;
}

// 日期格式
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  inputType: string;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                     title,
                                                     editable,
                                                     children,
                                                     dataIndex,
                                                     record,
                                                     handleSave,
                                                     inputType,
                                                     ...restProps
                                                   }) => {
  const [editing, setEditing] = useState<boolean>(false)
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    // 这里需要判定时间格式
    if (dataIndex === 'datetime') {
      form.setFieldsValue({ [dataIndex]: dayjs(record[dataIndex], dateFormat) })
      return
    }
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const options = [
    {
      label: '近30天',
      value: '1'
    },
    {
      label: '近15天',
      value: '2'
    },
    {
      label: '近一周',
      value: '3'
    },
    {
      label: '自定义',
      value: '4'
    }
  ]

  /**
   * 保存
   */
  const save = async () => {
    try {
      const values = await form.validateFields()

      toggleEdit()
      handleSave({ ...record, ...values })
      // 判定如果选择的是最近多长时间的，则将时间设置到数据列中去
      if (dataIndex === 'saveTime' && values['saveTime'] !== '4') {
        const saveTime = values['saveTime']
        const current = moment()
        let value = ''
        switch (saveTime) {
          case '1':
            value = current.subtract(30, 'days').format(dateFormat)
            break
          case '2':
            value = current.subtract(15, 'days').format(dateFormat)
            break
          case '3':
            value = current.subtract(7, 'days').format(dateFormat)
            break
        }
        if (value !== '') {
          form.setFieldsValue({ [dataIndex]: value })
          handleSave({ ...record, ...values, ...{ datetime: value } })
        }
      }
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  /**
   * 时间切换
   * @param _dayjs
   * @param dateStr
   */
  const datetimeChange = (_dayjs: any, dateStr: any) => {
    toggleEdit()
    handleSave({ ...record, ...{ datetime: dateStr } })
  }

  /**
   * 禁止的日期
   * @param current
   */
  const disableDate = (current: any) => {
    // 禁止选择当前日期之后的日期
    return current && current > moment().endOf('day')
  }

  let childNode = children
  let input: React.ReactNode | string
  switch (inputType) {
    case 'text':
      input = <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      break
    case 'select':
      input = <Select onChange={save} options={options} />
      break
    case 'datetime':
      input = <DatePicker showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }} disabled={record.saveTime != '4'}
                          disabledDate={disableDate}
                          onChange={datetimeChange} allowClear={false} />
      break
    case 'checkbox':
      input = <Checkbox defaultChecked={record.containDir} onChange={save} />
      break
    default:
      input = ''
      break
  }

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        valuePropName={dataIndex === 'containDir' ? 'checked' : 'value'}
        rules={[
          {
            required: true,
            message: `${title} 不能为空.`
          }
        ]}
      >
        {input}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  logPath: string;
  saveTime: string;
  datetime?: string;
  containDir: boolean;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

type FileTableProps = {
  onSave: (date: any) => void;
  datasource: DataType[];
  setDatasource: any
}

const FileTable: React.FC<FileTableProps> = (props: FileTableProps) => {
  const { onSave, datasource, setDatasource } = props

  useEffect(() => {
    ipcRenderer.removeAllListeners('save_result')
    // 监听主进程发送过来的保存配置的结果
    ipcRenderer.on('save_result', (_event, arg) => {
      // 提示保存成或失败
      if (arg['success']) {
        antdUtils.message?.success('配置保存成功')
      } else {
        antdUtils.message?.error('配置保存失败！原因：' + arg['err'])
      }
    })
  }, [])


  const [count, setCount] = useState(2)

  const handleDelete = (key: React.Key) => {
    const newData = datasource.filter((item) => item.key !== key)
    setDatasource(newData)
  }

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string, inputType?: string })[] = [
    {
      title: '日志路径',
      dataIndex: 'logPath',
      width: '40%',
      editable: true,
      ellipsis: true,
      inputType: 'text'
    },
    {
      title: '保留时长',
      dataIndex: 'saveTime',
      width: '15%',
      editable: true,
      inputType: 'select',
      render: (_, record) =>
        <span>{record.saveTime === '1' ? '近30天' : (record.saveTime === '2' ? '近15天' : (record.saveTime === '3' ? '近一周' : '自定义'))}</span>
    },
    {
      // title: '时长',
      title: '保留时间',
      dataIndex: 'datetime',
      width: '25%',
      editable: true,
      inputType: 'datetime'
    },
    {
      title: '包含子文件夹',
      dataIndex: 'containDir',
      width: '10%',
      editable: true,
      inputType: 'checkbox',
      render: (_, record) =>
        record.containDir ? <span style={{ color: 'green' }}>是</span> : <span>否</span>
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_, record) =>
        datasource.length >= 1 ? (
          <Popconfirm title="确定删除吗?删除后不可恢复！" onConfirm={() => handleDelete(record.key)}>
            <a>删除</a>
          </Popconfirm>
        ) : null
    }
  ]

  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      logPath: `日志文件路径`,
      saveTime: '1',
      datetime: moment().subtract(30, 'days').format(dateFormat),
      containDir: true
    }
    setDatasource([...datasource, newData])
    setCount(count + 1)
  }

  /**
   * 新增数据后的操作
   * @param row
   */
  const handleSave = (row: DataType) => {
    const newData = [...datasource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row
    })
    setDatasource(newData)
  }


  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  }

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType: col.inputType,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave
      })
    }
  })

  return (
    <div>
      <Space>
        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }} icon={<PlusOutlined />}>
          新增
        </Button>
        <Button onClick={() => onSave(datasource)} type="primary" style={{ marginBottom: 16 }}
                icon={<SaveOutlined />}>
          存储
        </Button>
      </Space>
      <Table
        scroll={{ y: 240 }}
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={datasource}
        columns={columns as ColumnTypes}
      />
    </div>
  )
}

export default FileTable
