import {Outlet, useNavigate} from "react-router-dom";
import React, {useEffect} from 'react'

const RouterBeforeEach: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/home");
  }, [])
  return <Outlet/>
}
export default RouterBeforeEach
