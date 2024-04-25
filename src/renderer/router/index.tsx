import React, { Suspense, useEffect } from 'react'
import { antdUtils } from '../utils/antd'
import { App, Skeleton } from 'antd'
import { useRoutes } from 'react-router-dom'

const lazyLoad = (moduleName: string) => {
  const viteModule = import.meta.glob('../**/*.tsx')
  //组件地址
  let URL: string
  if (moduleName === 'layouts') {
    URL = `../layouts/index.tsx`
  } else if (moduleName.endsWith('.tsx')) {
    URL = `../views/${moduleName}`
  } else {
    URL = `../views/${moduleName}/index.tsx`
  }
  const Module = React.lazy(viteModule[`${URL}`] as any)
  return (
    <Module />
  )
}

const routes = [
  {
    path: '/',
    component: lazyLoad('layouts').type,
    children: [
      {
        path: '/timer',
        component: lazyLoad('Timer').type
      },
      {
        path: '/updater',
        component: lazyLoad('Updater').type
      },
      {
        path: '/exception',
        component: lazyLoad('LogAnalysis').type
      },
      {
        path: '*',
        component: lazyLoad('404').type
      }
    ]
  }
]

// 路由处理方式
const generateRouter = (routers: any): any => {
  return routers.map((item: any) => {
    if (item.children) {
      item.children = generateRouter(item.children)
    }
    item.element = <Suspense fallback={<Skeleton />}>
      <item.component />
    </Suspense>
    {
      /* 把懒加载的异步路由变成组件装载进去 */
    }
    return item
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Router = () => {
  const route = generateRouter(routes)
  const { notification, message, modal } = App.useApp()
  useEffect(() => {
    antdUtils.setMessageInstance(message)
    antdUtils.setNotificationInstance(notification)
    antdUtils.setModalInstance(modal)
  }, [notification, message, modal])
  return useRoutes(route)
}

//根据路径获取路由
const checkAuth = (routers: any, path: string) => {
  for (const data of routers) {
    if (data.path == path) return data
    if (data.children) {
      const res: any = checkAuth(data.children, path)
      if (res) return res
    }
  }
  return null
}

const checkRouterAuth = (path: string) => {
  let auth = null
  auth = checkAuth(routes, path)
  return auth
}

export { Router, checkRouterAuth }
