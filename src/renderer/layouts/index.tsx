import { Flex, Layout, Spin } from 'antd'
import React, { Suspense, useEffect,useState } from 'react'
import RouterBeforeEach from '../router/RouterBeforeEach'
import MyMenu from './MyMenu'
import './layout.css'
const { ipcRenderer } = window.electron


const Layouts: React.FC = () => {

  let [version,setVersion] =  useState<string>('1.0.0');

  useEffect(() => {
    ipcRenderer.removeAllListeners('version_result')
    // 监听主进程发送过来的保存配置的结果
    ipcRenderer.on('version_result', (_event, arg) => {
      if(arg!=undefined && arg.length > 0){
        setVersion(arg)
      }
    })
    // 向主进程发送消息，请求获取定时计划的配置信息
    ipcRenderer.send('get-version')
  }, [])

  return (
    <>
    <Flex gap="middle" vertical={false} style={{height: '100%'}}>
      <Layout style={{backgroundColor: '#efeeee'}}>
        <Layout.Sider style={{backgroundColor: '#ffffff', padding: '10px 0'}}>
          <MyMenu/>
          <span style={{position: 'fixed', bottom: '2px', color:'rgba(31,31,31,0.5)', left:'5px'}}>{version}</span>
        </Layout.Sider>
        
        <Layout.Content className="dis-fl fd-c self-scroll"
                        style={{
                          overflowY: 'auto',
                          overflowX: 'hidden',
                          padding: '10px'
                        }}>
          <Suspense fallback={
            <div className="dis-fl jc-ct ai-ct" style={{height: '100vh'}}>
              <Spin size="large"/>
            </div>
          }>
            <RouterBeforeEach/>
          </Suspense>
        </Layout.Content>
      </Layout>
    </Flex>
    </>
  )
}
export default Layouts
