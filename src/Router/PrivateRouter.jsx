import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PanelAdministrador } from '../pages/PanelAdministrador';
import { FormularioUsuario } from '../components/Dashboard/FormularioUsuario';
import { FormularioProducto } from '../components/Dashboard/FormularioProducto';
import { DashboardContent } from '../components/Dashboard/DashboardContainer';
import { GestionMovimiento } from '../components/Dashboard/GestionMovimiento';
import { GestionVentas } from '../components/Dashboard/GestionVentas';
import { GestionInventario } from '../components/Dashboard/GestionInventario';
import { GestionReportes } from '../components/Dashboard/GestionReportes';


export const PrivateRouter = () => {
  return (  
    <Routes>
      {/* Rutas anidadas - PanelAdministrador siempre visible */}
      <Route path="/" element={<PanelAdministrador />}>
        <Route index element={<DashboardContent />} />
        <Route path="usuario" element={<FormularioUsuario />} />
        <Route path="productos" element={<FormularioProducto />} />
        <Route path="dashboard" element={<DashboardContent />} />
         <Route path="movimiento" element={<GestionMovimiento />} />
           <Route path="venta" element={<GestionVentas />} />
             <Route path="inventario" element={<GestionInventario/>} />
                  <Route path="reporte" element={<GestionReportes/>} />
      </Route>
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};