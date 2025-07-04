import React from 'react'
import { Navigate } from 'react-router-dom';
export const AppRouterPrivate = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};
