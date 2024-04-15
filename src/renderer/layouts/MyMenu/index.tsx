import React, { useState } from 'react';
import { SettingOutlined, FileOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import './index.css';
import { useNavigate } from 'react-router-dom';

const items: MenuProps['items'] = [
  {
    key: 'config',
    label: '配置中心',
    icon: <SettingOutlined style={{fontSize: '28px', marginTop: '21px'}}/>,
    children: [
          {
            label: '配置清除目标',
            key: '/home',
          },
          {
            label: '配置定时计划',
            key: '/timer',
          },
    ],
  },

  {
    key: '/file',
    label: '文件',
    icon: <FileOutlined style={{fontSize: '28px', marginTop: '21px'}}/>,
  },
  {
    label: '扩展',
    title: '扩展',
    key: 'extension',
    icon: <ColumnWidthOutlined style={{fontSize: '28px', marginTop: '21px'}}/>,
    disabled: true,
    // children: [
    //       {
    //         label: 'Option 1',
    //         key: 'setting:5',
    //       },
    //       {
    //         label: 'Option 2',
    //         key: 'setting:6',
    //       },
    // ],
  }
];

const MyMenu: React.FC = () => {
  const [current, setCurrent] = useState('/home');
  const navigate = useNavigate();
  const onClick: MenuProps['onClick'] = (e) => {
    const {key} = e;

    setCurrent(e.key);
    navigate(key)
  };



  return <Menu onClick={onClick} style={{height: '100%', paddingTop: '12px'}} selectedKeys={[current]} mode="inline" theme="light" items={items} />;
};

export default MyMenu;