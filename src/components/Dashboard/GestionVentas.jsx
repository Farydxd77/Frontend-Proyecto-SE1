import React, { useState, useEffect } from 'react';
import { fetchConToken } from '../../helpers/fetch';

export const GestionVentas = () => {
  // Estados para ventas
  const [ventas, setVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [errorVentas, setErrorVentas] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Estados para modal
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoadingVentas(true);
      setErrorVentas(null);
      
      const response = await fetchConToken('venta');
      console.log('Ventas desde API:', response);
      
      setVentas(response);
      
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setErrorVentas('Error al cargar las ventas');
      setVentas([]);
    } finally {
      setLoadingVentas(false);
    }
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el emoji del estado
  const getEstadoEmoji = (estado) => {
    switch (estado) {
      case 'completada':
        return '✅';
      case 'pendiente':
        return '⏳';
      case 'cancelada':
        return '❌';
      default:
        return '📋';
    }
  };

  // Filtrar ventas por estado
  const ventasFiltradas = ventas.filter(venta => {
    if (filtroEstado === 'todas') return true;
    return venta.estado === filtroEstado;
  });

  // Función para ver detalles de la venta
  const verDetallesVenta = (venta) => {
    setVentaSeleccionada(venta);
    setShowVentaModal(true);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  return (
    <>
      {/* Sección de Ventas */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🛒 Gestión de Ventas</h2>
            <div className="flex items-center gap-4">
              {errorVentas && (
                <span className="text-red-600 text-sm">⚠️ {errorVentas}</span>
              )}
              <button
                onClick={cargarVentas}
                disabled={loadingVentas}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingVentas ? '🔄' : '🔄'} Recargar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todas">Todas las ventas</option>
              <option value="completada">Completadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Total Ventas</h3>
              <p className="text-2xl font-bold text-blue-900">{ventas.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Completadas</h3>
              <p className="text-2xl font-bold text-green-900">
                {ventas.filter(v => v.estado === 'completada').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800">Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {ventas.filter(v => v.estado === 'pendiente').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">Canceladas</h3>
              <p className="text-2xl font-bold text-red-900">
                {ventas.filter(v => v.estado === 'cancelada').length}
              </p>
            </div>
          </div>
        </div>

        {loadingVentas ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando ventas...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((venta) => (
                    <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {venta.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatearFecha(venta.fecha)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        {venta.cliente}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {venta.cantidadItems} items
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                        {formatearPrecio(venta.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                          {getEstadoEmoji(venta.estado)} {venta.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => verDetallesVenta(venta)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          👁️ Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {ventasFiltradas.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron ventas con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalles de Venta */}
      {showVentaModal && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Detalles de Venta - {ventaSeleccionada.id.substring(0, 8)}...
              </h3>
              <button
                onClick={() => setShowVentaModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Información de la venta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Cliente:</label>
                  <p className="text-lg font-semibold">{ventaSeleccionada.cliente}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha:</label>
                  <p>{formatearFecha(ventaSeleccionada.fecha)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Usuario:</label>
                  <p>{ventaSeleccionada.usuario}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado:</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-2 ${getEstadoColor(ventaSeleccionada.estado)}`}>
                    {getEstadoEmoji(ventaSeleccionada.estado)} {ventaSeleccionada.estado}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Items:</label>
                  <p className="text-lg font-semibold">{ventaSeleccionada.cantidadItems}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total:</label>
                  <p className="text-2xl font-bold text-green-600">{formatearPrecio(ventaSeleccionada.total)}</p>
                </div>
              </div>
            </div>

            {/* Detalles de productos */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Productos:</h4>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-4 border-b font-medium text-gray-700">Producto</th>
                      <th className="text-left py-2 px-4 border-b font-medium text-gray-700">Talla</th>
                      <th className="text-left py-2 px-4 border-b font-medium text-gray-700">Color</th>
                      <th className="text-left py-2 px-4 border-b font-medium text-gray-700">Cantidad</th>
                      <th className="text-left py-2 px-4 border-b font-medium text-gray-700">P. Unitario</th>
                      <th className="text-left py-2 px-4 border-b font-medium text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventaSeleccionada.detalles.map((detalle, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4 text-sm">{detalle.nombreProducto}</td>
                        <td className="py-2 px-4 text-sm font-medium">{detalle.talla}</td>
                        <td className="py-2 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: detalle.color }}
                            ></div>
                            <span>{detalle.color}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-sm font-medium">{detalle.cantidad}</td>
                        <td className="py-2 px-4 text-sm">{formatearPrecio(detalle.precioUnitario)}</td>
                        <td className="py-2 px-4 text-sm font-semibold">{formatearPrecio(detalle.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                onClick={() => setShowVentaModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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