import React, { useState, useEffect, useContext } from 'react';
import { fetchConToken } from '../../helpers/fetch';
import { AuthContext } from '../../auth/AuthContext';

export const GestionMovimiento = () => {
     const {auth} = useContext(AuthContext);
     const { uid } = auth;
  // Estados para movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);
  const [errorMovimientos, setErrorMovimientos] = useState(null);

  // Estados para proveedores
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Estados para variedades de productos
  const [variedades, setVariedades] = useState([]);
  const [variedadesFiltradas, setVariedadesFiltradas] = useState([]);
  const [loadingVariedades, setLoadingVariedades] = useState(false);
  const [busquedaVariedades, setBusquedaVariedades] = useState('');

  // Estados para búsqueda
  const [busquedaMovimientos, setBusquedaMovimientos] = useState('');

  // Estados para modales
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);

  // Estados para el formulario de movimiento
  const [movimientoForm, setMovimientoForm] = useState({
    usuarioId: uid, // Usuario fijo por ahora
    proveedorId: '',
    montoTotal: 0,
    detalles: []
  });

  // Estados para agregar detalles
  const [nuevoDetalle, setNuevoDetalle] = useState({
    productoVariedadId: '',
    cantidad: 1,
    precio: 0
  });

  // Cargar movimientos al montar el componente
  useEffect(() => {
    cargarMovimientos();
  }, []);

  // Cargar proveedores y variedades cuando se abre el modal
  useEffect(() => {
    if (showMovimientoModal) {
      cargarProveedores();
      cargarVariedades();
    }
  }, [showMovimientoModal]);

  // Filtrar variedades cuando cambia la búsqueda
  useEffect(() => {
    if (busquedaVariedades.trim() === '') {
      setVariedadesFiltradas(variedades);
    } else {
      const filtradas = variedades.filter(variedad =>
        variedad.productoNombre?.toLowerCase().includes(busquedaVariedades.toLowerCase()) ||
        variedad.tallaNombre?.toLowerCase().includes(busquedaVariedades.toLowerCase()) ||
        variedad.color?.toLowerCase().includes(busquedaVariedades.toLowerCase())
      );
      setVariedadesFiltradas(filtradas);
    }
  }, [busquedaVariedades, variedades]);

  const cargarMovimientos = async () => {
    try {
      setLoadingMovimientos(true);
      setErrorMovimientos(null);
      
      const response = await fetchConToken('movimiento-inv');
      console.log('Movimientos desde API:', response);
      
      if (response && Array.isArray(response)) {
        setMovimientos(response);
      } else {
        setMovimientos([]);
      }
      
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      setErrorMovimientos('Error al cargar los movimientos');
      setMovimientos([]);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const cargarProveedores = async () => {
    try {
      setLoadingProveedores(true);
      const response = await fetchConToken('proveedor');
      console.log('Proveedores desde API:', response);
      
      if (response && Array.isArray(response)) {
        setProveedores(response);
      } else {
        setProveedores([]);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  const cargarVariedades = async () => {
    try {
      setLoadingVariedades(true);
      const response = await fetchConToken('producto/variedades');
      console.log('Variedades desde API:', response);
      
      if (response && Array.isArray(response)) {
        setVariedades(response);
        setVariedadesFiltradas(response);
      } else {
        setVariedades([]);
        setVariedadesFiltradas([]);
      }
    } catch (error) {
      console.error('Error al cargar variedades:', error);
      setVariedades([]);
      setVariedadesFiltradas([]);
    } finally {
      setLoadingVariedades(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearMontoTotal = (monto) => {
    return typeof monto === 'number' ? monto.toFixed(2) : '0.00';
  };

  const getTipoMovimientoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'salida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularMontoTotal = () => {
    const total = movimientoForm.detalles.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precio);
    }, 0);
    return total;
  };

  const agregarDetalle = () => {
    if (!nuevoDetalle.productoVariedadId || nuevoDetalle.cantidad <= 0 || nuevoDetalle.precio <= 0) {
      alert('Por favor complete todos los campos del detalle correctamente');
      return;
    }

    const variedad = variedades.find(v => v.id === nuevoDetalle.productoVariedadId);
    if (!variedad) {
      alert('Variedad de producto no encontrada');
      return;
    }

    const detalleCompleto = {
      ...nuevoDetalle,
      productoNombre: variedad.productoNombre,
      tallaNombre: variedad.tallaNombre,
      color: variedad.color
    };

    setMovimientoForm(prev => ({
      ...prev,
      detalles: [...prev.detalles, detalleCompleto]
    }));

    // Limpiar formulario de detalle
    setNuevoDetalle({
      productoVariedadId: '',
      cantidad: 1,
      precio: 0
    });
  };

  const eliminarDetalle = (index) => {
    setMovimientoForm(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitMovimiento = async () => {
    try {
      if (!movimientoForm.proveedorId || movimientoForm.detalles.length === 0) {
        alert('Por favor seleccione un proveedor y agregue al menos un detalle');
        return;
      }

      const montoTotal = calcularMontoTotal();
      
      const movimientoData = {
        usuarioId: movimientoForm.usuarioId,
        proveedorId: movimientoForm.proveedorId,
        montoTotal: montoTotal,
        detalles: movimientoForm.detalles.map(detalle => ({
          productoVariedadId: detalle.productoVariedadId,
          cantidad: detalle.cantidad,
          precio: detalle.precio
        }))
      };

      console.log('Datos a enviar:', movimientoData);
      
      const response = await fetchConToken('movimiento-inv', movimientoData, 'POST');
      console.log('Movimiento creado:', response);
      
      alert('Movimiento creado exitosamente');
      resetMovimientoForm();
      await cargarMovimientos();
      
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      alert('Error al crear el movimiento. Por favor intenta nuevamente.');
    }
  };

  const resetMovimientoForm = () => {
    setMovimientoForm({
      usuarioId: '621b5b45-cb05-48ce-8ec6-3d2315276597',
      proveedorId: '',
      montoTotal: 0,
      detalles: []
    });
    setNuevoDetalle({
      productoVariedadId: '',
      cantidad: 1,
      precio: 0
    });
    setBusquedaVariedades('');
    setShowMovimientoModal(false);
  };

  const movimientosFiltrados = (movimientos || []).filter(movimiento => 
    movimiento.usuario?.toLowerCase().includes(busquedaMovimientos.toLowerCase()) ||
    movimiento.proveedor?.toLowerCase().includes(busquedaMovimientos.toLowerCase()) ||
    movimiento.detalles?.some(detalle => 
      detalle.producto?.toLowerCase().includes(busquedaMovimientos.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📦 Gestión de Movimientos de Inventario</h2>
          <div className="flex items-center gap-4">
            {errorMovimientos && (
              <span className="text-red-600 text-sm">⚠️ {errorMovimientos}</span>
            )}
            <button
              onClick={cargarMovimientos}
              disabled={loadingMovimientos}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              {loadingMovimientos ? '🔄' : '🔄'} Recargar
            </button>
            <button
              onClick={() => setShowMovimientoModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <span>➕</span>
              Crear Movimiento
            </button>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar movimientos por usuario, proveedor o producto..."
            value={busquedaMovimientos}
            onChange={(e) => setBusquedaMovimientos(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Estado de carga para movimientos */}
      {loadingMovimientos ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Cargando movimientos...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Monto Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Proveedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Productos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientosFiltrados.length > 0 ? movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {movimiento.id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearFecha(movimiento.fecha)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${formatearMontoTotal(movimiento.montoTotal)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movimiento.usuario || 'Sin usuario'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movimiento.proveedor || 'Sin proveedor'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 max-w-[200px]">
                        {(movimiento.detalles || []).slice(0, 2).map((detalle, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-800 truncate" title={detalle.producto}>
                              {detalle.producto || 'Producto desconocido'}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-blue-600">
                                Talla: {detalle.talla || 'N/A'}
                              </span>
                              <span className="text-gray-600">
                                Color: {detalle.color || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-600 font-medium">
                                ${typeof detalle.precio === 'number' ? detalle.precio.toFixed(2) : '0.00'}
                              </span>
                              <span className="text-gray-500">
                                Cant: {detalle.cantidad || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(movimiento.detalles || []).length > 2 && (
                          <div className="text-xs text-blue-600 cursor-pointer hover:underline">
                            +{movimiento.detalles.length - 2} productos más...
                          </div>
                        )}
                        {(!movimiento.detalles || movimiento.detalles.length === 0) && (
                          <span className="text-gray-400 text-xs">Sin productos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <button 
                          className="text-blue-600 hover:text-blue-900 text-xs hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          👁️ Ver detalle
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 text-xs hover:bg-green-50 px-2 py-1 rounded transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {loadingMovimientos ? 'Cargando movimientos...' : 'No se encontraron movimientos'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear Movimiento */}
      {showMovimientoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Crear Nuevo Movimiento de Inventario</h3>
              <button
                onClick={resetMovimientoForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Información general */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                  <select
                    value={movimientoForm.proveedorId}
                    onChange={(e) => setMovimientoForm({...movimientoForm, proveedorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={loadingProveedores}
                  >
                    <option value="">
                      {loadingProveedores ? 'Cargando proveedores...' : 'Selecciona un proveedor'}
                    </option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre} - {proveedor.email}
                      </option>
                    ))}
                  </select>
                  {movimientoForm.proveedorId && (
                    <div className="mt-1 text-xs text-gray-500">
                      ID: {movimientoForm.proveedorId}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Total Calculado
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-lg font-semibold text-green-600">
                    ${calcularMontoTotal().toFixed(2)}
                  </div>
                </div>

                {/* Lista de detalles agregados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Productos Agregados ({movimientoForm.detalles.length})
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {movimientoForm.detalles.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay productos agregados
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {movimientoForm.detalles.map((detalle, index) => (
                          <div key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {detalle.productoNombre}
                              </div>
                              <div className="text-sm text-gray-600">
                                Talla: {detalle.tallaNombre} • Color: {detalle.color}
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {detalle.cantidad} x ${detalle.precio.toFixed(2)} = ${(detalle.cantidad * detalle.precio).toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() => eliminarDetalle(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna derecha - Agregar productos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Producto/Variedad
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por producto, talla o color..."
                      value={busquedaVariedades}
                      onChange={(e) => setBusquedaVariedades(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Variedad de Producto
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {loadingVariedades ? (
                      <div className="p-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-sm text-gray-600">Cargando variedades...</p>
                      </div>
                    ) : variedadesFiltradas.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {busquedaVariedades ? 'No se encontraron variedades' : 'No hay variedades disponibles'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {variedadesFiltradas.map((variedad) => (
                          <button
                            key={variedad.id}
                            onClick={() => setNuevoDetalle({...nuevoDetalle, productoVariedadId: variedad.id, precio: variedad.precio || 0})}
                            className={`w-full p-3 text-left hover:bg-blue-50 transition-colors ${
                              nuevoDetalle.productoVariedadId === variedad.id ? 'bg-blue-100 border-blue-500' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">
                              {variedad.productoNombre}
                            </div>
                            <div className="text-sm text-gray-600">
                              Talla: {variedad.tallaNombre} • Color: {variedad.color}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              Precio: ${(variedad.precio || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {variedad.id?.substring(0, 8)}...
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulario para agregar detalle */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">Agregar al Movimiento</h4>
                  
                  {nuevoDetalle.productoVariedadId && (
                    <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                      <strong>Producto seleccionado:</strong><br />
                      ID: {nuevoDetalle.productoVariedadId?.substring(0, 8)}...
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={nuevoDetalle.cantidad}
                        onChange={(e) => setNuevoDetalle({...nuevoDetalle, cantidad: parseInt(e.target.value) || 1})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={nuevoDetalle.precio}
                        onChange={(e) => setNuevoDetalle({...nuevoDetalle, precio: parseFloat(e.target.value) || 0})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={agregarDetalle}
                    disabled={!nuevoDetalle.productoVariedadId || nuevoDetalle.cantidad <= 0 || nuevoDetalle.precio <= 0}
                    className="w-full mt-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Agregar Producto
                  </button>
                </div>
              </div>
            </div>

            {/* Botones finales */}
            <div className="flex space-x-4 pt-6 mt-6 border-t">
              <button
                onClick={handleSubmitMovimiento}
                disabled={!movimientoForm.proveedorId || movimientoForm.detalles.length === 0}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Crear Movimiento (${calcularMontoTotal().toFixed(2)})
              </button>
              <button
                onClick={resetMovimientoForm}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};