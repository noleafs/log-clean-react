import React, { useContext, useEffect, useRef, useState } from 'react'
import { Checkbox, GetRef, InputRef, Select, Space } from 'antd'
import { Button, Form, Input, Popconfirm, Table } from 'antd'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface Item {
  key: string;
  logPath: string;
  saveTime: string;
  containDir: boolean;
}

interface EditableRowProps {
  index: number;
}

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
      label: '其他',
      value: '3'
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
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  let childNode = children

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
        {
          inputType === 'text' ? <Input value={record.logPath} ref={inputRef} onPressEnter={save} onBlur={save} /> :
            (inputType === 'select' ? <Select value={record.logPath} onChange={save} options={options} /> :
              <Checkbox defaultChecked={record.containDir} onChange={save} />)
        }
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
  containDir: boolean;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const FileTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
      key: '0',
      logPath: '日志文件路径',
      saveTime: '1',
      containDir: true
    }
  ])

  const [count, setCount] = useState(2)

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key)
    setDataSource(newData)
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
      width: '20%',
      editable: true,
      inputType: 'select',
      render: (_, record) =>
        <span>{record.saveTime === '1' ? '近30天' : '近15天'}</span>
    },
    {
      title: '包含子文件夹',
      dataIndex: 'containDir',
      width: '20%',
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
        dataSource.length >= 1 ? (
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
      containDir: true
    }
    setDataSource([...dataSource, newData])
    setCount(count + 1)
  }

  const handleSave = (row: DataType) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row
    })
    setDataSource(newData)
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
        <Button onClick={() => {
          console.log(dataSource)
        }} type="primary" style={{ marginBottom: 16 }} icon={<SaveOutlined />}>
          存储
        </Button>
      </Space>
      <Table
        scroll={{ y: 240 }}
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
      />
    </div>
  )
}

export default FileTable
