import React, { useState, useEffect } from 'react';
import { fetchConToken } from '../../helpers/fetch';

export const GestionInventario = () => {
  // Estados para inventario
  const [inventario, setInventario] = useState([]);
  const [loadingInventario, setLoadingInventario] = useState(true);
  const [errorInventario, setErrorInventario] = useState(null);
  const [filtroProducto, setFiltroProducto] = useState('');
  const [filtroTalla, setFiltroTalla] = useState('');
  const [filtroStock, setFiltroStock] = useState('');

  // Estados para modal
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoadingInventario(true);
      setErrorInventario(null);
      
      const response = await fetchConToken('producto/variedades');
      console.log('Inventario desde API:', response);
      console.log('Primer item del inventario:', response[0]);
      
      setInventario(response);
      
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setErrorInventario('Error al cargar el inventario');
      setInventario([]);
    } finally {
      setLoadingInventario(false);
    }
  };

  // Obtener productos únicos para el filtro
  const productosUnicos = [...new Set(inventario.map(item => item.productoNombre))];
  
  // Obtener tallas únicas para el filtro
  const tallasUnicas = [...new Set(inventario.map(item => item.tallaNombre))];

  // Filtrar inventario
  const inventarioFiltrado = inventario.filter(item => {
    const coincideProducto = filtroProducto === '' || item.productoNombre.toLowerCase().includes(filtroProducto.toLowerCase());
    const coincideTalla = filtroTalla === '' || item.tallaNombre === filtroTalla;
    
    let coincideStock = true;
    if (filtroStock === 'disponible') {
      coincideStock = item.cantidad > 0;
    } else if (filtroStock === 'bajo') {
      coincideStock = item.cantidad > 0 && item.cantidad <= 5;
    } else if (filtroStock === 'agotado') {
      coincideStock = item.cantidad === 0;
    }
    
    return coincideProducto && coincideTalla && coincideStock;
  });

  // Función para ver detalles del item
  const verDetallesItem = (item) => {
    setItemSeleccionado(item);
    setShowInventarioModal(true);
  };

  // Formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  // Agrupar por producto para estadísticas
  const estadisticasPorProducto = inventario.reduce((acc, item) => {
    if (!acc[item.productoNombre]) {
      acc[item.productoNombre] = {
        totalVariedades: 0,
        precioPromedio: 0,
        tallas: new Set()
      };
    }
    acc[item.productoNombre].totalVariedades += 1;
    acc[item.productoNombre].tallas.add(item.tallaNombre);
    return acc;
  }, {});

  return (
    <>
      {/* Sección de Inventario */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📦 Gestión de Inventario</h2>
            <div className="flex items-center gap-4">
              {errorInventario && (
                <span className="text-red-600 text-sm">⚠️ {errorInventario}</span>
              )}
              <button
                onClick={cargarInventario}
                disabled={loadingInventario}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingInventario ? '🔄' : '🔄'} Recargar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por producto:
              </label>
              <input
                type="text"
                value={filtroProducto}
                onChange={(e) => setFiltroProducto(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por talla:
              </label>
              <select
                value={filtroTalla}
                onChange={(e) => setFiltroTalla(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas las tallas</option>
                {tallasUnicas.map(talla => (
                  <option key={talla} value={talla}>{talla}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del stock:
              </label>
              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos</option>
                <option value="disponible">Con stock</option>
                <option value="bajo">Stock bajo (≤5)</option>
                <option value="agotado">Sin stock</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Total Variedades</h3>
              <p className="text-2xl font-bold text-blue-900">{inventario.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">En Stock</h3>
              <p className="text-2xl font-bold text-green-900">
                {inventario.filter(item => item.cantidad > 0).length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">Sin Stock</h3>
              <p className="text-2xl font-bold text-red-900">
                {inventario.filter(item => item.cantidad === 0).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800">Stock Bajo (≤5)</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {inventario.filter(item => item.cantidad > 0 && item.cantidad <= 5).length}
              </p>
            </div>
          </div>
        </div>

        {loadingInventario ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando inventario...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Talla</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        {item.productoNombre}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.tallaNombre}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: item.color }}
                            title={item.color}
                          ></div>
                          <span className="text-xs text-gray-500">{item.color}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="text-center">
                          <span 
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              item.cantidad === 0 
                                ? 'bg-red-100 text-red-800' 
                                : item.cantidad <= 5 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.cantidad === 0 ? '❌ 0' : 
                             item.cantidad <= 5 ? `⚠️ ${item.cantidad}` : 
                             `✅ ${item.cantidad}`}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.cantidad === 1 ? 'unidad' : 'unidades'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                        {formatearPrecio(item.precio)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => verDetallesItem(item)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-3"
                        >
                          👁️ Ver
                        </button>
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium mr-3">
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inventarioFiltrado.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {inventario.length === 0 
                      ? "No hay productos en el inventario" 
                      : "No se encontraron productos con los filtros aplicados"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalles del Item */}
      {showInventarioModal && itemSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Detalles del Producto
              </h3>
              <button
                onClick={() => setShowInventarioModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Información del producto */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID del Producto:</label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                      {itemSeleccionado.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre del Producto:</label>
                    <p className="text-lg font-semibold">{itemSeleccionado.productoNombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Talla:</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 ml-2">
                      {itemSeleccionado.tallaNombre}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Precio:</label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatearPrecio(itemSeleccionado.precio)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Stock Disponible:</label>
                    <div className="mt-2">
                      <span 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-medium ${
                          itemSeleccionado.cantidad === 0 
                            ? 'bg-red-100 text-red-800' 
                            : itemSeleccionado.cantidad <= 5 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {itemSeleccionado.cantidad === 0 ? '❌ Sin stock' : 
                         itemSeleccionado.cantidad <= 5 ? `⚠️ ${itemSeleccionado.cantidad} unidades (Stock bajo)` : 
                         `✅ ${itemSeleccionado.cantidad} unidades`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Color:</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: itemSeleccionado.color }}
                      ></div>
                      <div>
                        <p className="font-medium">{itemSeleccionado.color}</p>
                        <p className="text-sm text-gray-500">Código hexadecimal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* IDs técnicos */}
              <div className="border-t pt-4 mt-6">
                <h4 className="text-lg font-semibold mb-3">Información Técnica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID del Producto:</label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                      {itemSeleccionado.productoId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID de la Talla:</label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                      {itemSeleccionado.tallaId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
              <button
                onClick={() => setShowInventarioModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Editar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};