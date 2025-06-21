import React from 'react'
import { Navigate, Route } from 'react-router-dom'
export const AppRouterPublic = ({ isAuthenticated, children }) => {
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};
