import React from 'react'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { Navigate, Route, Routes } from 'react-router-dom'
export const AuthRouter = () => {
  return (
      <div className="limiter">
	     	<div className="container-login100">
		  	<div className="wrap-login100 p-t-50 p-b-90">     
        <Routes>
          <Route path='login' element={ <LoginPage/> } />
          <Route path='register' element={ <RegisterPage/> } />
          <Route path='*' element={ <Navigate to='login' replace={true}/> } />
        </Routes>
         </div>
          </div>
      </div>

  )
}
