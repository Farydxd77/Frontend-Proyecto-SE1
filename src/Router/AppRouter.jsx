import React, { useContext } from 'react'
import { AppRouterPublic } from './AppRouterPublic'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { AuthContext } from '../auth/AuthContext'
import { AppRouterPrivate } from './AppRouterPrivate'
import { AuthRouter } from './AuthRouter'
import { PanelAdministrador } from '../pages/PanelAdministrador'
export const AppRouter = () => {

  const { auth } = useContext( AuthContext );

  // if ( auth.checking ) {
  //   return <h1>Espere Porfavorcito ing Martinez</h1>
  // }

  return (
    <>
        <Routes>
           <Route path="/auth/*" element={
             <AppRouterPublic isAuthenticated={auth.logged}>
               <AuthRouter />
             </AppRouterPublic>
           } />
            <Route path="/" element={
             <AppRouterPrivate isAuthenticated={auth.logged}>
               <PanelAdministrador />
             </AppRouterPrivate>
           } />

           {/* Ruta por defecto */}
           <Route path="*" element={<Navigate to="/" replace />} />
          
         </Routes>
    </>
  )
}
