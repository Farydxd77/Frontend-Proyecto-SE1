import React, { useState, useEffect } from 'react';
import { fetchConToken } from '../../helpers/fetch';

export const GestionCategorias = () => {
  // Estados para categorías
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(null);

  // Estados para modales
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);

  // Estados para el formulario de categoría
  const [formCategoria, setFormCategoria] = useState({
    name: '',
    subcategories: [],
    isActive: true
  });
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);

  // Estados para búsqueda
  const [busquedaCategorias, setBusquedaCategorias] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      setErrorCategorias(null);
      
      const response = await fetchConToken('categoria/findAll');
      console.log('Categorías desde API:', response);
      
      setCategorias(response);
      
    } catch (error) {
      console.error('Error al cargar categorías no tiene permisos:', error);
      setErrorCategorias('Error al cargar las categorías no tiene permisos');
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Función para guardar nueva categoría
  const guardarCategoria = async () => {
    try {
      setGuardandoCategoria(true);
      
      // Validaciones
      if (!formCategoria.name.trim()) {
        alert('El nombre de la categoría es obligatorio ');
        return;
      }
      
      if (formCategoria.subcategories.length === 0) {
        alert('Debe agregar al menos una subcategoría');
        return;
      }
      console.log("hola chavales")
      console.log(formCategoria + 'hola')
      const response = await fetchConToken('categoria', formCategoria, 'POST');

      console.log('Categoría creada:', response);
      
      // Limpiar formulario
      setFormCategoria({
        name: '',
        subcategories: [],
        isActive: true
      });
      setNuevaSubcategoria('');
      
      // Cerrar modal
      setShowCategoriaModal(false);
      
      // Recargar categorías
      await cargarCategorias();
      
      alert('Categoría creada exitosamente');
      
    } catch (error) {
      console.error('Error al crear categoría no tiene permisos:', error);
      alert('Error al crear la categoría. Por favor intenta nuevamente no tiene permisos.');
    } finally {
      setGuardandoCategoria(false);
    }
  };

  // Función para agregar subcategoría
  const agregarSubcategoria = () => {
    if (nuevaSubcategoria.trim() && !formCategoria.subcategories.includes(nuevaSubcategoria.trim())) {
      setFormCategoria(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, nuevaSubcategoria.trim()]
      }));
      setNuevaSubcategoria('');
    }
  };

  // Función para eliminar subcategoría
  const eliminarSubcategoria = (index) => {
    setFormCategoria(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }));
  };

  // Función para cerrar modal y limpiar formulario
  const cerrarModalCategoria = () => {
    setShowCategoriaModal(false);
    setFormCategoria({
      name: '',
      subcategories: [],
      isActive: true
    });
    setNuevaSubcategoria('');
  };

  // Filtros
  const categoriasFiltradas = categorias.filter(categoria => 
    categoria.name.toLowerCase().includes(busquedaCategorias.toLowerCase())
  );

  return (
    <>
      {/* Sección de Categorías */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📁 Gestión de Categorías</h2>
            <div className="flex items-center gap-4">
              {errorCategorias && (
                <span className="text-red-600 text-sm">⚠️ {errorCategorias}</span>
              )}
              <button
                onClick={cargarCategorias}
                disabled={loadingCategorias}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingCategorias ? '🔄' : '🔄'} Recargar
              </button>
              <button
                onClick={() => setShowCategoriaModal(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Agregar Categoría
              </button>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={busquedaCategorias}
              onChange={(e) => setBusquedaCategorias(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {loadingCategorias ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando categorías...</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasFiltradas.map((categoria) => (
              <div key={categoria.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📁 {categoria.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      categoria.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {categoria.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-900">✏️</button>
                    <button className="text-red-600 hover:text-red-900">🗑️</button>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Subcategorías:</p>
                  <div className="flex flex-wrap gap-1">
                    {categoria.subcategories.map((sub, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Agregar Categoría */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              📁 Agregar Nueva Categoría
            </h3>
            
            <div className="space-y-4">
              {/* Nombre de la categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={formCategoria.name}
                  onChange={(e) => setFormCategoria(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Camisetas, Pantalones, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={guardandoCategoria}
                />
              </div>

              {/* Estado activo */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formCategoria.isActive}
                  onChange={(e) => setFormCategoria(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  disabled={guardandoCategoria}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Categoría activa
                </label>
              </div>

              {/* Subcategorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategorías *
                </label>
                
                {/* Input para agregar subcategoría */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={nuevaSubcategoria}
                    onChange={(e) => setNuevaSubcategoria(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && agregarSubcategoria()}
                    placeholder="Escribir subcategoría y presionar Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    disabled={guardandoCategoria}
                  />
                  <button
                    type="button"
                    onClick={agregarSubcategoria}
                    disabled={!nuevaSubcategoria.trim() || guardandoCategoria}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    ➕
                  </button>
                </div>

                {/* Lista de subcategorías agregadas */}
                {formCategoria.subcategories.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {formCategoria.subcategories.map((sub, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => eliminarSubcategoria(index)}
                            disabled={guardandoCategoria}
                            className="ml-1 text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          >
                            ❌
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formCategoria.subcategories.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No hay subcategorías. Agrega al menos una.
                  </p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={cerrarModalCategoria}
                disabled={guardandoCategoria}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCategoria}
                disabled={guardandoCategoria || !formCategoria.name.trim() || formCategoria.subcategories.length === 0}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {guardandoCategoria ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    💾 Guardar Categoría
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};