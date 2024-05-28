import React, { useState } from 'react'
import {
  SettingOutlined,
  // ColumnWidthOutlined,
  FieldTimeOutlined,
  SearchOutlined,
  // AppstoreOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Input, Menu } from 'antd'
import './index.css'
import { useNavigate } from 'react-router-dom'

const items: MenuProps['items'] = [
  {
    key: '/timer',
    label: '配置管理',
    icon: <FieldTimeOutlined />
  },
  // {
  //   key: '/exception',
  //   label: '日志异常分析',
  //   icon: <ColumnWidthOutlined />
  // },
  // {
  //   key: '/updater',
  //   label: '软件更新',
  //   icon: <AppstoreOutlined />
  // },
  {
    label: '更多',
    title: '更多',
    key: 'more',
    icon: <SettingOutlined />
  }
]

const MyMenu: React.FC = () => {
  const [current, setCurrent] = useState('/timer')
  const navigate = useNavigate()
  const onClick: MenuProps['onClick'] = (e) => {
    const { key } = e

    setCurrent(e.key)
    navigate(key)
  }

  return (
    <>
      <Input
        prefix={<SearchOutlined />}
        placeholder="搜索（敬请期待）"
        style={{
          width: 'calc(100% - 40px)',
          margin: '6px auto',
          display: 'flex',
          backgroundColor: '#efeeee'
        }}
        disabled
      />
      <Menu
        onClick={onClick}
        style={{ height: '100%', paddingTop: '12px' }}
        selectedKeys={[current]}
        mode="inline"
        theme="light"
        items={items}
      />
    </>
  )
}

export default MyMenu
