import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DashboardContent = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Ventas Totales', value: '$45,231', change: '+12%', color: 'bg-blue-500' },
    { title: 'Usuarios Activos', value: '2,431', change: '+3%', color: 'bg-green-500' },
    { title: 'Pedidos Hoy', value: '156', change: '+8%', color: 'bg-purple-500' },
    { title: 'Ingresos', value: '$12,426', change: '+15%', color: 'bg-orange-500' },
  ];

  const quickActions = [
    {
      title: 'Gestión de Productos',
      description: 'Administrar catálogo de productos',
      icon: '🛍️',
      color: 'bg-blue-500',
      route: '/admin/productos'
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      color: 'bg-green-500',
      route: '/admin/usuarios'
    },
    {
      title: 'Movimiento Inventario',
      description: 'Control de entradas y salidas',
      icon: '📦',
      color: 'bg-purple-500',
      route: '/admin/movimiento'
    }
  ];

  const handleQuickAction = (route) => {
    navigate(route);
  };

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

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.route)}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-gray-300 text-left group"
            >
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg mr-3 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h4 className="font-medium text-gray-800 group-hover:text-gray-900">{action.title}</h4>
              </div>
              <p className="text-sm text-gray-600 group-hover:text-gray-700">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

   

    </div>
  );
};