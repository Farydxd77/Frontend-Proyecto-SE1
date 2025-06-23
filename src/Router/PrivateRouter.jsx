import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PanelAdministrador } from '../pages/PanelAdministrador';
import { FormularioUsuario } from '../components/Dashboard/FormularioUsuario';
import { FormularioProducto } from '../components/Dashboard/FormularioProducto';
import { DashboardContent } from '../components/Dashboard/DashboardContainer';


export const PrivateRouter = () => {
  return (
    <Routes>
      {/* Rutas anidadas - PanelAdministrador siempre visible */}
      <Route path="/" element={<PanelAdministrador />}>
        <Route index element={<DashboardContent />} />
        <Route path="usuario" element={<FormularioUsuario />} />
        <Route path="productos" element={<FormularioProducto />} />
        <Route path="dashboard" element={<DashboardContent />} />
      </Route>
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};