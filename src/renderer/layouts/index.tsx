import { Layout, Spin } from 'antd'
import React, { Suspense } from 'react'
import RouterBeforeEach from '../router/RouterBeforeEach'
import MyMenu from './MyMenu'

const Layouts: React.FC = () => {
  return (
    <>
      <Layout.Header>
        <MyMenu/>
      </Layout.Header>
      <Layout.Content className="dis-fl fd-c"
                      style={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
        <Suspense fallback={
          <div className="dis-fl jc-ct ai-ct" style={{height: '100vh'}}>
            <Spin size="large"/>
          </div>
        }>
          <RouterBeforeEach/>
        </Suspense>
      </Layout.Content>
    </>
  )
}
export default Layouts
