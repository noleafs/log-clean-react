import {Outlet, useNavigate} from "react-router-dom";
import React, {useEffect} from 'react'

const RouterBeforeEach: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/timer");
  }, [])
  return <Outlet/>
}
export default RouterBeforeEach
