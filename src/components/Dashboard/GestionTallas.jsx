import React, { useState, useEffect } from 'react';
import { fetchConToken } from '../../helpers/fetch';

export const GestionTallas = () => {
  // Estados para sizes
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(true);
  const [errorSizes, setErrorSizes] = useState(null);

  // Estados para modales
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarSizes();
  }, []);

  const cargarSizes = async () => {
    try {
      setLoadingSizes(true);
      setErrorSizes(null);
      
      const response = await fetchConToken('size');
      console.log('Sizes desde API:', response);
      
      setSizes(response);
      
    } catch (error) {
      console.error('Error al cargar sizes:', error);
      setErrorSizes('Error al cargar los sizes');
      setSizes([]);
    } finally {
      setLoadingSizes(false);
    }
  };

  return (
    <>
      {/* Sección de Sizes */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📏 Gestión de Tallas</h2>
            <div className="flex items-center gap-4">
              {errorSizes && (
                <span className="text-red-600 text-sm">⚠️ {errorSizes}</span>
              )}
              <button
                onClick={cargarSizes}
                disabled={loadingSizes}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingSizes ? '🔄' : '🔄'} Recargar
              </button>
              <button
                onClick={() => setShowSizeModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Agregar Talla
              </button>
            </div>
          </div>
        </div>

        {loadingSizes ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando tallas...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sizes.map((size) => (
                <div key={size.id} className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-800">📏</span>
                    <div className="flex gap-1">
                      <button className="text-blue-600 hover:text-blue-900 text-sm">✏️</button>
                      <button className="text-red-600 hover:text-red-900 text-sm">🗑️</button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{size.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {size.id.substring(0, 8)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Talla (Por implementar) */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Talla</h3>
            <p className="text-gray-600">Modal por implementar...</p>
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => setShowSizeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};