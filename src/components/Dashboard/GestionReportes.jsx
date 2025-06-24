import React, { useState, useEffect } from 'react';
import { fetchConToken } from '../../helpers/fetch';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Simulación de jsPDF - en tu proyecto real instala: npm install jspdf jspdf-autotable

const generatePDF = (title, data) => {
  try {
    // Para instalar: npm install jspdf jspdf-autotable
    // import jsPDF from 'jspdf';
    // import 'jspdf-autotable';
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    doc.setFontSize(12);
    doc.text(JSON.stringify(data, null, 2), 20, 40);
    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    
    // Por ahora simulamos la descarga como JSON
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    console.log('📄 PDF generado (simulado):', title);
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error al generar el PDF');
  }
};

export const GestionReportes = () => {
  // Estados para datos base
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [reporteData, setReporteData] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({});

  // Configuración de reportes
  const reportes = [
    {
      id: 'ventas-resumen',
      titulo: '📊 Resumen de Ventas',
      descripcion: 'Totales y comparación con período anterior',
      endpoint: 'reportes/ventas/resumen',
      categoria: 'ventas',
      color: 'blue',
      params: ['fechaInicio', 'fechaFin', 'categoriaId', 'proveedorId', 'clienteId', 'usuarioId']
    },
    {
      id: 'ventas-top-productos',
      titulo: '🏆 Top Productos',
      descripcion: 'Productos más vendidos por cantidad o ingresos',
      endpoint: 'reportes/ventas/top-productos',
      categoria: 'ventas',
      color: 'green',
      params: ['limit', 'tipo', 'fechaInicio', 'fechaFin']
    },
    {
      id: 'ventas-rendimiento-clientes',
      titulo: '👥 Rendimiento Clientes',
      descripcion: 'Clasificación y análisis de clientes',
      endpoint: 'reportes/ventas/rendimiento-clientes',
      categoria: 'ventas',
      color: 'purple',
      params: ['fechaInicio', 'fechaFin', 'categoriaId', 'proveedorId', 'clienteId', 'usuarioId']
    },
    {
      id: 'ventas-tendencias',
      titulo: '📈 Tendencias de Ventas',
      descripcion: 'Análisis de tendencias día a día',
      endpoint: 'reportes/ventas/tendencias',
      categoria: 'ventas',
      color: 'orange',
      params: ['fechaInicio', 'fechaFin', 'categoriaId', 'proveedorId', 'clienteId', 'usuarioId']
    },
    {
      id: 'inventario-stock-bajo',
      titulo: '⚠️ Stock Bajo',
      descripcion: 'Productos con inventario crítico',
      endpoint: 'reportes/inventario/stock-bajo',
      categoria: 'inventario',
      color: 'red',
      params: ['umbral', 'categoriaId']
    },
    {
      id: 'inventario-movimientos',
      titulo: '📦 Movimientos Inventario',
      descripcion: 'Entradas y salidas de productos',
      endpoint: 'reportes/inventario/movimientos',
      categoria: 'inventario',
      color: 'indigo',
      params: ['fechaInicio', 'fechaFin', 'categoriaId', 'proveedorId', 'clienteId', 'usuarioId']
    },
    {
      id: 'inventario-rotacion',
      titulo: '🔄 Rotación Inventario',
      descripcion: 'Análisis de rotación de productos',
      endpoint: 'reportes/inventario/rotacion',
      categoria: 'inventario',
      color: 'teal',
      params: ['fechaInicio', 'fechaFin', 'tipo', 'limit']
    },
    {
      id: 'inventario-valorizacion',
      titulo: '💰 Valorización Inventario',
      descripcion: 'Valor total del inventario por categorías',
      endpoint: 'reportes/inventario/valorizacion',
      categoria: 'inventario',
      color: 'yellow',
      params: []
    }
  ];

  // Cargar datos base al montar componente
  useEffect(() => {
    cargarDatosBase();
  }, []);

  const cargarDatosBase = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      console.log('🔄 Cargando datos base...');
      
      // Cargar todas las APIs en paralelo
      const [
        clientesResponse,
        usuariosResponse,
        categoriasResponse,
        proveedoresResponse
      ] = await Promise.all([
        fetchConToken('venta/clientes'),
        fetchConToken('auth/users'),
        fetchConToken('categoria/findAll'),
        fetchConToken('proveedor')
      ]);

      console.log('✅ Datos cargados:', {
        clientes: clientesResponse,
        usuarios: usuariosResponse,
        categorias: categoriasResponse,
        proveedores: proveedoresResponse
      });

      setClientes(Array.isArray(clientesResponse) ? clientesResponse : []);
      setUsuarios(Array.isArray(usuariosResponse) ? usuariosResponse : []);
      setCategorias(Array.isArray(categoriasResponse) ? categoriasResponse : []);
      setProveedores(Array.isArray(proveedoresResponse) ? proveedoresResponse : []);
      
    } catch (error) {
      console.error('❌ Error cargando datos base:', error);
      setError('Error al cargar los datos base. Verifique su conexión.');
      
      // Establecer arrays vacíos en caso de error
      setClientes([]);
      setUsuarios([]);
      setCategorias([]);
      setProveedores([]);
    } finally {
      setLoadingData(false);
    }
  };

  const abrirModal = (reporte) => {
    setModalType(reporte);
    setFormData({
      // Valores por defecto
      limit: '10',
      umbral: '10',
      tipo: reporte === 'ventas-top-productos' ? 'ingresos' : 
            reporte === 'inventario-rotacion' ? 'todas' : ''
    });
    setReporteData(null);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
    setReporteData(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generarReporte = async () => {
    try {
      setLoading(true);
      
      const reporte = reportes.find(r => r.id === modalType);
      if (!reporte) {
        alert('Reporte no encontrado');
        return;
      }

      // Preparar parámetros - solo incluir los que tienen valor
      const params = {};
      reporte.params.forEach(param => {
        if (formData[param] && formData[param] !== '') {
          params[param] = formData[param];
        }
      });

      console.log('📊 Generando reporte:', reporte.titulo);
      console.log('🔗 Endpoint:', reporte.endpoint);
      console.log('📋 Parámetros:', params);
      
      const data = await fetchConToken(reporte.endpoint, params);
      
      console.log('✅ Reporte generado:', data);
      setReporteData(data);
      
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      alert(`Error al generar el reporte: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    if (!reporteData) {
      alert('No hay datos para descargar');
      return;
    }
    
    const reporte = reportes.find(r => r.id === modalType);
    const titulo = reporte ? reporte.titulo.replace(/[📊🏆👥📈⚠️📦🔄💰]/g, '').trim() : 'Reporte';
    
    generatePDF(titulo, reporteData);
  };

  const renderFormField = (param, reporte) => {
    switch (param) {
      case 'fechaInicio':
      case 'fechaFin':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {param === 'fechaInicio' ? '📅 Fecha Inicio' : '📅 Fecha Fin'}
            </label>
            <input
              type="date"
              value={formData[param] || ''}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      
      case 'limit':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📏 Límite (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData[param] || '10'}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      
      case 'umbral':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚠️ Umbral de Stock Mínimo
            </label>
            <input
              type="number"
              min="0"
              value={formData[param] || '10'}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      
      case 'tipo':
        if (reporte.id === 'ventas-top-productos') {
          return (
            <div key={param} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Tipo de Ranking
              </label>
              <select
                value={formData[param] || 'ingresos'}
                onChange={(e) => handleInputChange(param, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ingresos">💰 Por Ingresos</option>
                <option value="cantidad">📦 Por Cantidad</option>
              </select>
            </div>
          );
        } else if (reporte.id === 'inventario-rotacion') {
          return (
            <div key={param} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Tipo de Rotación
              </label>
              <select
                value={formData[param] || 'todas'}
                onChange={(e) => handleInputChange(param, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">🔍 Todas</option>
                <option value="rapida">⚡ Rápida</option>
                <option value="lenta">🐌 Lenta</option>
              </select>
            </div>
          );
        }
        break;
      
      case 'categoriaId':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Categoría
            </label>
            <select
              value={formData[param] || ''}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.subcategories && cat.subcategories.length > 0 && `(${cat.subcategories.join(', ')})`}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'proveedorId':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏭 Proveedor
            </label>
            <select
              value={formData[param] || ''}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(prov => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                  {prov.telefono && ` - ${prov.telefono}`}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'clienteId':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Cliente
            </label>
            <select
              value={formData[param] || ''}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.firstName && cliente.lastName 
                    ? `${cliente.firstName} ${cliente.lastName}`
                    : cliente.fullName || cliente.email}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'usuarioId':
        return (
          <div key={param} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👨‍💼 Usuario
            </label>
            <select
              value={formData[param] || ''}
              onChange={(e) => handleInputChange(param, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.fullName || usuario.email}
                  {usuario.rolNombre && ` (${usuario.rolNombre})`}
                </option>
              ))}
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600 border-blue-200 text-blue-600',
      green: 'bg-green-500 hover:bg-green-600 border-green-200 text-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600 border-purple-200 text-purple-600',
      orange: 'bg-orange-500 hover:bg-orange-600 border-orange-200 text-orange-600',
      red: 'bg-red-500 hover:bg-red-600 border-red-200 text-red-600',
      indigo: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-200 text-indigo-600',
      teal: 'bg-teal-500 hover:bg-teal-600 border-teal-200 text-teal-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-200 text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  const currentReporte = reportes.find(r => r.id === modalType);

  if (loadingData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Cargando datos del sistema...</h2>
          <p className="text-gray-600">Obteniendo clientes, usuarios, categorías y proveedores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">📊 Gestión de Reportes</h1>
        <p className="text-gray-600 mb-4">
          Genera reportes detallados de ventas e inventario con exportación a PDF
        </p>
        
        {/* Stats de datos cargados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-sm text-gray-500">Clientes</div>
            <div className="text-xl font-bold text-blue-600">{clientes.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-sm text-gray-500">Usuarios</div>
            <div className="text-xl font-bold text-green-600">{usuarios.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-sm text-gray-500">Categorías</div>
            <div className="text-xl font-bold text-purple-600">{categorias.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-sm text-gray-500">Proveedores</div>
            <div className="text-xl font-bold text-orange-600">{proveedores.length}</div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={cargarDatosBase}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              🔄 Reintentar
            </button>
          </div>
        )}
        
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Generando reporte...</span>
            </div>
          </div>
        )}
      </div>

      {/* Reportes de Ventas */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          💰 Reportes de Ventas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportes.filter(r => r.categoria === 'ventas').map(reporte => {
            const colorClass = getColorClasses(reporte.color);
            return (
              <div key={reporte.id} className={`bg-white rounded-lg shadow-lg border-l-4 border-l-${reporte.color}-500 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {reporte.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">
                  {reporte.descripcion}
                </p>
                <button
                  onClick={() => abrirModal(reporte.id)}
                  disabled={loading || loadingData}
                  className={`w-full px-4 py-3 bg-${reporte.color}-500 hover:bg-${reporte.color}-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold`}
                >
                  📈 Generar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reportes de Inventario */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          📦 Reportes de Inventario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportes.filter(r => r.categoria === 'inventario').map(reporte => (
            <div key={reporte.id} className={`bg-white rounded-lg shadow-lg border-l-4 border-l-${reporte.color}-500 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {reporte.titulo}
              </h3>
              <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">
                {reporte.descripcion}
              </p>
              <button
                onClick={() => abrirModal(reporte.id)}
                disabled={loading || loadingData}
                className={`w-full px-4 py-3 bg-${reporte.color}-500 hover:bg-${reporte.color}-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold`}
              >
                📊 Generar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Configuración */}
      {showModal && currentReporte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {currentReporte.titulo}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-white hover:text-gray-200 text-3xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-blue-100 mt-2 text-lg">{currentReporte.descripcion}</p>
            </div>

            <div className="p-6">
              {currentReporte.params.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    🔧 Configuración del Reporte
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentReporte.params.map(param => renderFormField(param, currentReporte))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">ℹ️</span>
                    <p className="text-blue-800 text-lg font-medium">
                      Este reporte no requiere configuración adicional
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <button
                  onClick={generarReporte}
                  disabled={loading}
                  className={`flex-1 px-6 py-4 bg-${currentReporte.color}-500 hover:bg-${currentReporte.color}-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3 font-semibold text-lg`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      📊 Generar Reporte
                    </>
                  )}
                </button>
                
                {reporteData && (
                  <button
                    onClick={descargarPDF}
                    className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-3 font-semibold text-lg"
                  >
                    📄 Descargar PDF
                  </button>
                )}
                
                <button
                  onClick={cerrarModal}
                  className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold text-lg"
                >
                  Cerrar
                </button>
              </div>

              {/* Vista previa de datos */}
              {reporteData && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h5 className="font-bold text-gray-800 mb-4 text-xl flex items-center gap-2">
                    📋 Vista Previa del Reporte
                  </h5>
                  <div className="bg-white p-4 rounded-lg border max-h-80 overflow-auto">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(reporteData, null, 2)}
                    </pre>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    💡 Los datos se mostrarán formateados en el PDF descargado
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};