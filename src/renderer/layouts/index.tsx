import { Flex, Layout, Spin } from 'antd'
import React, { Suspense } from 'react'
import RouterBeforeEach from '../router/RouterBeforeEach'
import MyMenu from './MyMenu'

const Layouts: React.FC = () => {
  return (
    <>
    <Flex gap="middle" vertical={false} style={{height: '100%'}}>
      <Layout>
        <Layout.Sider collapsed>
          <MyMenu/>
        </Layout.Sider>
        <Layout.Content className="dis-fl fd-c"
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
