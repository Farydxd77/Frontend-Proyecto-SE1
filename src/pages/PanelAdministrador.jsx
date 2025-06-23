import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export const PanelAdministrador = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/' },
    { 
      id: 'users', 
      name: 'Usuarios', 
      icon: '👥',
      hasSubmenu: true,
      submenu: [
        { id: 'users-list', name: 'Ver Usuarios', icon: '👀', path: '/usuario' },
      ]
    },
    { 
      id: 'products', 
      name: 'Productos', 
      icon: '📦',
      hasSubmenu: true,
      submenu: [
        { id: 'products-list', name: 'Ver Productos', icon: '📋', path: '/productos' },
        { id: 'products-create', name: 'Crear Producto', icon: '➕' },
        { id: 'products-categories', name: 'Categorías', icon: '🏷️' },
        { id: 'products-inventory', name: 'Inventario', icon: '📊' }
      ]
    },
    { id: 'orders', name: 'Pedidos', icon: '🛒' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'Configuración', icon: '⚙️' },
    { id: 'reports', name: 'Reportes', icon: '📋' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
  ];

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      // Toggle del submenu
      setExpandedMenus(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      // Navegar a la ruta del item
      if (item.path) {
        navigate(item.path);
      }
      // Cerrar todos los submenus
      setExpandedMenus({});
    }
  };

  const handleSubmenuClick = (subItem) => {
    if (subItem.path) {
      navigate(subItem.path);
    }
  };

  const getCurrentSectionName = () => {
    // Obtener la ruta actual
    const currentPath = location.pathname;
    
    // Buscar en items principales
    const mainItem = menuItems.find(item => item.path === currentPath);
    if (mainItem) return mainItem.name;

    // Buscar en submenus
    for (const item of menuItems) {
      if (item.submenu) {
        const submenuItem = item.submenu.find(sub => sub.path === currentPath);
        if (submenuItem) return submenuItem.name;
      }
    }
    
    return 'Dashboard';
  };

  const isActive = (item) => {
    return location.pathname === item.path;
  };

  const isSubmenuActive = (subItem) => {
    return location.pathname === subItem.path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">AdminPanel</h1>
          <p className="text-sm text-gray-500">Panel de Control</p>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Item principal */}
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                  isActive(item) ? 'bg-blue-100 border-r-4 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.hasSubmenu && (
                  <span className={`transform transition-transform ${expandedMenus[item.id] ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                )}
              </button>

              {/* Submenu */}
              {item.hasSubmenu && expandedMenus[item.id] && (
                <div className="bg-gray-50">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleSubmenuClick(subItem)}
                      className={`w-full flex items-center px-12 py-2 text-left hover:bg-blue-50 transition-colors text-sm ${
                        isSubmenuActive(subItem) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      <span className="text-base mr-3">{subItem.icon}</span>
                      <span>{subItem.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 w-64 p-4 border-t bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{getCurrentSectionName()}</h2>
              <p className="text-gray-600">Bienvenido al panel de administración</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Contenido Principal - Aquí se renderizan las rutas anidadas */}
        <main className="p-6 overflow-y-auto h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};