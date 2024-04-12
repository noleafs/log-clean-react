import { Layout, Spin } from 'antd'
import React, { Suspense } from 'react'
import RouterBeforeEach from '../router/RouterBeforeEach'

const Layouts: React.FC = () => {
  return (
    <>
      <div className="titleBar">这是菜单栏</div>
      <Layout.Content className="dis-fl fd-c"
                      style={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '6px'
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
