import React from 'react';
import { GestionCategorias } from './GestionCategorias';
import { GestionTallas } from './GestionTallas';
import { GestionProductos } from './GestionProductos';

export const FormularioProducto = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Componente de Gestión de Categorías */}
      <GestionCategorias />

      {/* Componente de Gestión de Tallas */}
      <GestionTallas />

      {/* Componente de Gestión de Productos */}
      <GestionProductos />
    </div>
  );
};