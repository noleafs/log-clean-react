import React, { useState } from 'react';
import { SettingOutlined, FileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import './index.css';
import { useNavigate } from 'react-router-dom';

const items: MenuProps['items'] = [
  {
    label: '文件',
    key: 'file',
    icon: <FileOutlined />,
    children: [
          {
            label: '打开配置文件',
            key: '/home',
          },
          {
            label: '配置定时计划',
            key: '/timer',
          },
    ],
  },
  {
    label: '配置',
    key: 'config',
    icon: <SettingOutlined />,
    children: [
          {
            label: 'Option 1',
            key: 'setting:5',
          },
          {
            label: 'Option 2',
            key: 'setting:6',
          },
    ],
  },
  {
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        跳转组件
      </a>
    ),
    key: 'alipay',
  },
];

const MyMenu: React.FC = () => {
  const [current, setCurrent] = useState('file');
  const navigate = useNavigate();
  const onClick: MenuProps['onClick'] = (e) => {
    const {key} = e;

    setCurrent(e.key);
    navigate(key)
  };

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default MyMenu;