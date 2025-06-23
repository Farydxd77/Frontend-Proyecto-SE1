import React from 'react';

export const DashboardContent = () => {
  const stats = [
    { title: 'Ventas Totales', value: '$45,231', change: '+12%', color: 'bg-blue-500' },
    { title: 'Usuarios Activos', value: '2,431', change: '+3%', color: 'bg-green-500' },
    { title: 'Pedidos Hoy', value: '156', change: '+8%', color: 'bg-purple-500' },
    { title: 'Ingresos', value: '$12,426', change: '+15%', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4`}>
                {index + 1}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos adicionales o contenido del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Ventas Recientes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Producto A</span>
              <span className="font-semibold text-green-600">+$1,234</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Producto B</span>
              <span className="font-semibold text-green-600">+$987</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Producto C</span>
              <span className="font-semibold text-green-600">+$756</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Actividad de Usuarios</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Usuarios Conectados</span>
              <span className="font-semibold text-blue-600">147</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Nuevos Registros</span>
              <span className="font-semibold text-blue-600">23</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Sesiones Activas</span>
              <span className="font-semibold text-blue-600">89</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de actividad reciente */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">📋 Actividad Reciente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Juan Pérez</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Creó un nuevo producto</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Hace 2 horas</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completado
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">María García</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Actualizó inventario</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Hace 4 horas</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completado
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Carlos López</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Procesó pedido #1234</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Hace 6 horas</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};