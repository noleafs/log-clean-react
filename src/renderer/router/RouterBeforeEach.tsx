import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import React, { useEffect } from 'react'

const RouterBeforeEach: React.FC = () => {

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log("当前路由",location.pathname)
  }, [location])

  useEffect(() => {
    navigate('/timer')
  }, [])
  return <Outlet />
}
export default RouterBeforeEach
