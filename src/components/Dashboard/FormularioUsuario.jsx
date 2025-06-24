import React, { useState, useEffect } from 'react';
import { fetchSinToken, fetchConToken } from '../../helpers/fetch'; // Ajusta a ruta

export const FormularioUsuario = () => {
  // Estados para usuarios - ahora se cargarán desde la API
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState(null);

  // Estados para roles - ahora se cargarán desde la API
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState(null);

  // Estados para modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  // Estados para formularios
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    rolId: ''
  });

  const [roleForm, setRoleForm] = useState({
    nombre: '',
    descripcion: '',
    permisos: []
  });

  const [busqueda, setBusqueda] = useState('');

  // Cargar roles y usuarios desde la API al montar el componente
  useEffect(() => {
    cargarRoles();
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      setErrorUsuarios(null);
      
      const response = await fetchConToken('auth/users');
      console.log('Usuarios desde API:', response);
      
      // Adaptar los usuarios de la API al formato que espera el componente
      const usuariosAdaptados = response.map((usuario, index) => ({
        id: usuario.id || index + 1,
        nombre: usuario.nombre || usuario.fullName || 'Sin nombre',
        email: usuario.email || 'sin@email.com',
        rol: usuario.rol || usuario.rolNombre || 'cliente',
        // CORREGIDO: manejar el estado como boolean
        estado: usuario.estado !== undefined ? usuario.estado : 
                (usuario.isActive !== undefined ? usuario.isActive : false),
        fechaCreacion: usuario.fechaCreacion || usuario.createdAt || new Date().toISOString().split('T')[0]
      }));
      
      setUsuarios(usuariosAdaptados);
      
    } catch (error) {
      console.error('Error al cargar usuarios no tiene permiso:', error);
      setErrorUsuarios('Error al cargar los usuarios no tiene permisos');
      
      // Usuarios por defecto en caso de error - CORREGIDO: estados como boolean
      setUsuarios([
        { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Admin', estado: true, fechaCreacion: '2024-01-15' },
        { id: 2, nombre: 'María García', email: 'maria@example.com', rol: 'Editor', estado: true, fechaCreacion: '2024-02-20' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', rol: 'Viewer', estado: false, fechaCreacion: '2024-03-10' },
        { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', rol: 'Editor', estado: true, fechaCreacion: '2024-04-05' },
      ]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const cargarRoles = async () => {
    try {
      setLoadingRoles(true);
      setErrorRoles(null);
      
      // Usar fetchConToken si no necesitas autenticación, o fetchConToken si sí
      const response = await fetchConToken('rol');
      
      console.log('Roles desde API:', response);
      
      // Asumiendo que la respuesta tiene la estructura correcta
      if (response && Array.isArray(response)) {
        setRoles(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else if (response && response.roles && Array.isArray(response.roles)) {
        setRoles(response.roles);
      } else {
        console.log('Estructura de respuesta:', response);
        setErrorRoles('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error al cargar roles no tiene permisos:', error);
      setErrorRoles('Error al cargar los roles no tiene permisos');
      
      // Mantener roles por defecto en caso de error
      setRoles([
        { id: 1, nombre: 'Admin', descripcion: 'Acceso completo al sistema', permisos: ['Crear', 'Editar', 'Eliminar', 'Ver'] },
        { id: 2, nombre: 'Editor', descripcion: 'Puede crear y editar contenido', permisos: ['Crear', 'Editar', 'Ver'] },
        { id: 3, nombre: 'Viewer', descripcion: 'Solo puede ver el contenido', permisos: ['Ver'] },
      ]);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Resto de funciones igual...
  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        // TODO: Implementar edición de usuario con API
        setUsuarios(usuarios.map(user => 
          user.id === editingUser.id 
            ? { ...user, nombre: userForm.fullName, email: userForm.email, rolId: userForm.rolId }
            : user
        ));
      } else {
        // Crear nuevo usuario usando la API
        const nuevoUsuarioData = {
          email: userForm.email,
          password: userForm.password,
          fullName: userForm.fullName,
          rolId: userForm.rolId
        };
        
        console.log('Creando usuario:', nuevoUsuarioData);
        const response = await fetchSinToken('auth/register', nuevoUsuarioData, 'POST');
        console.log('Usuario creado:', response);
        
        // Recargar los usuarios para obtener la lista actualizada
        await cargarUsuarios();
      }
      resetUserForm();
    } catch (error) {
      console.error('Error al crear usuario no tiene permisos:', error);
      alert('Error al crear el usuario. Por favor intenta nuevamente. no tiene permisos');
    }
  };

  const resetUserForm = () => {
    setUserForm({ fullName: '', email: '', password: '', rolId: '' });
    setEditingUser(null);
    setShowUserModal(false);
  };

  const editUser = (user) => {
    setUserForm({
      fullName: user.nombre,
      email: user.email,
      password: '', // No prellenar password por seguridad
      rolId: user.rolId
    });
    setEditingUser(user);
    setShowUserModal(true);
  };

  const deleteUser = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(user => user.id !== id));
    }
  };

  const handleRoleSubmit = async () => {
    try {
      if (editingRole) {
        // TODO: Implementar edición de rol con API
        setRoles(roles.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...roleForm }
            : role
        ));
      } else {
        // Crear nuevo rol usando la API
        const nuevoRolData = {
          nombre: roleForm.nombre
        };
        
        console.log('Creando rol:', nuevoRolData);
        const response = await fetchConToken('rol', nuevoRolData, 'POST');
        console.log('Rol creado:', response);
        
        // Recargar los roles para obtener la lista actualizada
        await cargarRoles();
      }
      resetRoleForm();
    } catch (error) {
      console.error('Error al crear rol no tiene permisos:', error);
      alert('Error al crear el rol. Por favor intenta nuevamente no tiene permisos.');
    }
  };

  const resetRoleForm = () => {
    setRoleForm({ nombre: '', descripcion: '', permisos: [] });
    setEditingRole(null);
    setShowRoleModal(false);
  };

  const editRole = (role) => {
    setRoleForm({
      nombre: role.nombre,
      descripcion: role.descripcion,
      permisos: [...role.permisos]
    });
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const deleteRole = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      setRoles(roles.filter(role => role.id !== id));
    }
  };

  const handlePermisoChange = (permiso) => {
    setRoleForm(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter(p => p !== permiso)
        : [...prev.permisos, permiso]
    }));
  };

  const usuariosFiltrados = usuarios.filter(user => 
    user.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    user.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    user.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Sección de Usuarios */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">👥 Gestión de Usuarios</h2>
            <div className="flex items-center gap-4">
              {errorUsuarios && (
                <span className="text-red-600 text-sm">⚠️ {errorUsuarios}</span>
              )}
              <button
                onClick={cargarUsuarios}
                disabled={loadingUsuarios}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingUsuarios ? '🔄' : '🔄'} Recargar
              </button>
              <button
                onClick={() => setShowUserModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Agregar Nuevo Usuario
              </button>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, email o rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Estado de carga para usuarios */}
        {loadingUsuarios ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.nombre.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.rol === 'Admin' || user.rol === 'admin' ? 'bg-red-100 text-red-800' :
                        user.rol === 'Editor' || user.rol === 'editor' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* CORREGIDO: Comparación con boolean */}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.estado === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fechaCreacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección de Roles */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🔑 Gestión de Roles</h2>
            <div className="flex items-center gap-4">
              {errorRoles && (
                <span className="text-red-600 text-sm">⚠️ {errorRoles}</span>
              )}
              <button
                onClick={cargarRoles}
                disabled={loadingRoles}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingRoles ? '🔄' : '🔄'} Recargar
              </button>
              <button
                onClick={() => setShowRoleModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Agregar Nuevo Rol
              </button>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {loadingRoles ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando roles...</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{role.nombre}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editRole(role)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.descripcion}</p>
                <div className="flex flex-wrap gap-1">
                  {(role.permisos || []).map((permiso) => (
                    <span key={permiso} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {permiso}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Rose Mary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="rosem2@gmail.com"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Leyendas132"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={userForm.rolId}
                  onChange={(e) => setUserForm({...userForm, rolId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                      <span className="text-gray-500 text-xs"> (ID: {role.id.substring(0, 8)}...)</span>
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleUserSubmit}
                  disabled={!userForm.fullName || !userForm.email || !userForm.rolId || (!editingUser && !userForm.password)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Rol */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                <input
                  type="text"
                  required
                  value={roleForm.nombre}
                  onChange={(e) => setRoleForm({...roleForm, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  required
                  value={roleForm.descripcion}
                  onChange={(e) => setRoleForm({...roleForm, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                <div className="space-y-2">
                  {['Crear', 'Editar', 'Eliminar', 'Ver'].map(permiso => (
                    <label key={permiso} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roleForm.permisos.includes(permiso)}
                        onChange={() => handlePermisoChange(permiso)}
                        className="mr-2"
                      />
                      <span className="text-sm">{permiso}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleRoleSubmit}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  {editingRole ? 'Actualizar' : 'Crear'} Rol
                </button>
                <button
                  type="button"
                  onClick={resetRoleForm}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};