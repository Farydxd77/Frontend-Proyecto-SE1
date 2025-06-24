import React, { useState, useEffect } from 'react';
import { fetchConToken } from '../../helpers/fetch';

export const GestionProductos = () => {
  const cloud_name = "do9p2kjnq";
  const preset_name = "sw-proyecto-imagenes";

  // Estados para productos
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState(null);

  // Estados para categorías
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Estados para sizes
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(true);

  // Estados para modales
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);

  // Estados para búsqueda
  const [busquedaProductos, setBusquedaProductos] = useState('');

  // Estados para el formulario de producto
  const [productoForm, setProductoForm] = useState({
    name: '',
    description: '',
    subcategory: '',
    categoryId: '',
    imageUrls: [],
    productSizes: [],
    isActive: true
  });

  // Estados para upload de imagen
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Estados para el formulario de variedad
  const [variedadForm, setVariedadForm] = useState({
    selectedSizeId: '',
    color: '#000000',
    quantity: '',
    price: ''
  });

  // Cargar productos, categorías y sizes al montar el componente
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarSizes();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoadingProductos(true);
      setErrorProductos(null);
      
      const response = await fetchConToken('producto/findAll');
      console.log('Productos desde API:', response);
      
      let productosAdaptados = [];
      
      if (response && Array.isArray(response)) {
        productosAdaptados = response.map((producto) => {
          const variedades = producto.productoVariedad || [];
          const precioPromedio = variedades.length > 0 
            ? variedades.reduce((sum, v) => sum + (v.price || 0), 0) / variedades.length 
            : 0;
          
          const stockTotal = variedades.reduce((sum, v) => sum + (v.quantity || 0), 0);
          const coloresUnicos = [...new Set(variedades.map(v => v.color).filter(Boolean))];
          const imagenPrincipal = producto.images && producto.images.length > 0 
            ? producto.images[0].url 
            : null;

          return {
            id: producto.id,
            nombre: producto.name || 'Sin nombre',
            descripcion: producto.description || '',
            categoria: producto.category?.name || 'Sin categoría',
            subcategoria: producto.subcategory || 'Sin subcategoría',
            precio: precioPromedio,
            stock: stockTotal,
            colores: coloresUnicos,
            variedades: variedades.map(v => ({
              Id: v.Id,
              color: v.color,
              price: v.price,
              quantity: v.quantity
            })),
            imagenes: producto.images || [],
            imagenPrincipal: imagenPrincipal,
            sizes: ['S', 'M', 'L'],
            estado: producto.isActive ? 'Activo' : 'Inactivo',
            fechaCreacion: new Date().toISOString().split('T')[0],
            categoryId: producto.category?.id,
            subcategoryId: producto.subcategory
          };
        });
      }
      
      setProductos(productosAdaptados);
      console.log('Productos adaptados:', productosAdaptados);
      
    } catch (error) {
      console.error('Error al cargar productos no tinene permisos:', error);
      setErrorProductos('Error al cargar los productos no tinene permisos');
      setProductos([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await fetchConToken('categoria/findAll');
      console.log('Categorías desde API:', response);
      
      if (response && Array.isArray(response)) {
        setCategorias(response);
      } else {
        setCategorias([]);
      }
    } catch (error) {
      console.error('Error al cargar categorías no tinene permisos:', error);
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const cargarSizes = async () => {
    try {
      setLoadingSizes(true);
      const response = await fetchConToken('size');
      console.log('Sizes desde API:', response);
      
      if (response && Array.isArray(response)) {
        setSizes(response);
      } else {
        setSizes([]);
      }
    } catch (error) {
      console.error('Error al cargar sizes:', error);
      setSizes([]);
    } finally {
      setLoadingSizes(false);
    }
  };

  // Función para subir imagen a Cloudinary
  const subirImagenCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset_name);
    formData.append('cloud_name', cloud_name);

    try {
      setUploadingImage(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Error al subir imagen');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen. Por favor intenta nuevamente.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Manejar selección de imagen
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.');
      return;
    }

    const imageUrl = await subirImagenCloudinary(file);
    if (imageUrl) {
      setProductoForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, imageUrl]
      }));
    }
  };

  // Eliminar imagen
  const eliminarImagen = (index) => {
    setProductoForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  // Manejar selección de sizes
  const handleSizeSelection = () => {
    const { selectedSizeId, color, quantity, price } = variedadForm;
    
    if (!selectedSizeId || !color || !quantity || !price) {
      alert('Por favor completa todos los campos de la variedad');
      return;
    }

    const newSize = {
      size: selectedSizeId,
      color: color,
      quantity: parseInt(quantity) || 0,
      price: parseFloat(price) || 0
    };

    setSelectedSizes(prev => {
      const exists = prev.find(s => s.size === selectedSizeId && s.color === color);
      if (exists) {
        return prev.map(s => 
          s.size === selectedSizeId && s.color === color ? newSize : s
        );
      } else {
        return [...prev, newSize];
      }
    });

    setProductoForm(prev => ({
      ...prev,
      productSizes: [...prev.productSizes.filter(s => !(s.size === selectedSizeId && s.color === color)), newSize]
    }));

    // Limpiar formulario de variedad
    setVariedadForm({
      selectedSizeId: '',
      color: '#000000',
      quantity: '',
      price: ''
    });
  };

  // Eliminar size seleccionado
  const eliminarSize = (sizeId, color) => {
    setSelectedSizes(prev => prev.filter(s => !(s.size === sizeId && s.color === color)));
    setProductoForm(prev => ({
      ...prev,
      productSizes: prev.productSizes.filter(s => !(s.size === sizeId && s.color === color))
    }));
  };

  const handleProductoSubmit = async () => {
    try {
      if (editingProducto) {
        console.log('Editando producto:', productoForm);
      } else {
        const nuevoProductoData = {
          name: productoForm.name,
          description: productoForm.description,
          subcategory: productoForm.subcategory,
          categoryId: productoForm.categoryId,
          imageUrls: productoForm.imageUrls,
          productSizes: productoForm.productSizes,
          isActive: productoForm.isActive
        };
        
        console.log('Datos a enviar:', nuevoProductoData);
        const response = await fetchConToken('producto', nuevoProductoData, 'POST');
        console.log('Producto creado:', response);
        
        await cargarProductos();
      }
      resetProductoForm();
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto. Por favor intenta nuevamente.');
    }
  };

  const resetProductoForm = () => {
    setProductoForm({
      name: '',
      description: '',
      subcategory: '',
      categoryId: '',
      imageUrls: [],
      productSizes: [],
      isActive: true
    });
    setSelectedSizes([]);
    setVariedadForm({
      selectedSizeId: '',
      color: '#000000',
      quantity: '',
      price: ''
    });
    setEditingProducto(null);
    setShowProductoModal(false);
  };

  const editProducto = (producto) => {
    setProductoForm({
      name: producto.nombre,
      description: producto.descripcion,
      subcategory: producto.subcategoria,
      categoryId: producto.categoryId || '',
      imageUrls: producto.imagenes.map(img => img.url) || [],
      productSizes: [],
      isActive: producto.estado === 'Activo'
    });
    setEditingProducto(producto);
    setShowProductoModal(true);
  };

  const deleteProducto = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      setProductos(productos.filter(producto => producto.id !== id));
    }
  };

  const getSubcategoriasPorCategoria = (categoryId) => {
    const categoria = categorias.find(cat => cat.id === categoryId);
    return categoria ? categoria.subcategories || [] : [];
  };

  const verDetalleProducto = (producto) => {
    setProductoDetalle(producto);
    setShowDetalleModal(true);
  };

  const getSizeNameById = (sizeId) => {
    const size = sizes.find(s => s.id === sizeId);
    return size ? size.name : 'Desconocido';
  };

  const productosFiltrados = (productos || []).filter(producto => 
    producto.nombre?.toLowerCase().includes(busquedaProductos.toLowerCase()) ||
    producto.categoria?.toLowerCase().includes(busquedaProductos.toLowerCase())
  );

  return (
    <>
      {/* Sección de Productos */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🛍️ Gestión de Productos</h2>
            <div className="flex items-center gap-4">
              {errorProductos && (
                <span className="text-red-600 text-sm">⚠️ {errorProductos}</span>
              )}
              <button
                onClick={cargarProductos}
                disabled={loadingProductos}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {loadingProductos ? '🔄' : '🔄'} Recargar
              </button>
              <button
                onClick={() => setShowProductoModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Agregar Producto
              </button>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos por nombre o categoría..."
              value={busquedaProductos}
              onChange={(e) => setBusquedaProductos(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Estado de carga para productos */}
        {loadingProductos ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Precio Promedio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Stock Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Colores
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Variedades
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productosFiltrados.length > 0 ? productosFiltrados.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                            {producto.imagenPrincipal ? (
                              <img 
                                src={producto.imagenPrincipal} 
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400">🛍️</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={producto.nombre}>
                              {producto.nombre}
                            </div>
                            <div className="text-sm text-gray-500 truncate" title={producto.subcategoria}>
                              {producto.subcategoria}
                            </div>
                            <div className="text-xs text-gray-400 truncate" title={producto.descripcion}>
                              {producto.descripcion?.substring(0, 40)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          producto.stock > 20 ? 'bg-green-100 text-green-800' :
                          producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {producto.stock || 0} unidades
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {(producto.colores || []).map((color, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              ></div>
                              <span className="text-xs text-gray-600">{color}</span>
                            </div>
                          ))}
                          {(!producto.colores || producto.colores.length === 0) && (
                            <span className="text-gray-400 text-xs">Sin colores</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 max-w-[200px]">
                          {(producto.variedades || []).slice(0, 2).map((variedad, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-1 rounded">
                              <div className="flex items-center gap-1 mb-1">
                                <div 
                                  className="w-3 h-3 rounded border"
                                  style={{ backgroundColor: variedad.color }}
                                ></div>
                                <span className="font-medium text-gray-800 truncate" title={variedad.color}>
                                  {variedad.color || 'Sin color'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-600 font-medium">
                                  ${typeof variedad.price === 'number' ? variedad.price.toFixed(2) : '0.00'}
                                </span>
                                <span className="text-gray-500">
                                  {variedad.quantity || 0}u
                                </span>
                              </div>
                            </div>
                          ))}
                          {(producto.variedades || []).length > 2 && (
                            <div className="text-xs text-blue-600 cursor-pointer hover:underline"
                                 onClick={() => verDetalleProducto(producto)}>
                              +{producto.variedades.length - 2} más variedades...
                            </div>
                          )}
                          {(!producto.variedades || producto.variedades.length === 0) && (
                            <span className="text-gray-400 text-xs">Sin variedades</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          producto.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {producto.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={() => editProducto(producto)}
                            className="text-blue-600 hover:text-blue-900 text-xs hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={() => verDetalleProducto(producto)}
                            className="text-green-600 hover:text-green-900 text-xs hover:bg-green-50 px-2 py-1 rounded transition-colors"
                          >
                            👁️ Ver detalle
                          </button>
                          <button 
                            onClick={() => deleteProducto(producto.id)}
                            className="text-red-600 hover:text-red-900 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        {loadingProductos ? 'Cargando productos...' : 'No se encontraron productos'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar/Editar Producto */}
      {showProductoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingProducto ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Información básica */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={productoForm.name}
                    onChange={(e) => setProductoForm({...productoForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ej: Camiseta Polo Azul"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={productoForm.description}
                    onChange={(e) => setProductoForm({...productoForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Descripción del producto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={productoForm.categoryId}
                    onChange={(e) => setProductoForm({...productoForm, categoryId: e.target.value, subcategory: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {(categorias || []).map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.name}
                      </option>
                    ))}
                  </select>
                  {productoForm.categoryId && (
                    <div className="mt-1 text-xs text-gray-500">
                      ID: {productoForm.categoryId}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                  <select
                    value={productoForm.subcategory}
                    onChange={(e) => setProductoForm({...productoForm, subcategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={!productoForm.categoryId}
                    required
                  >
                    <option value="">Selecciona una subcategoría</option>
                    {(getSubcategoriasPorCategoria(productoForm.categoryId) || []).map((subcategoria, index) => (
                      <option key={index} value={subcategoria}>
                        {subcategoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={productoForm.isActive}
                    onChange={(e) => setProductoForm({...productoForm, isActive: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Columna derecha - Imágenes y Sizes */}
              <div className="space-y-4">
                {/* Sección de imágenes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                      disabled={uploadingImage}
                    />
                    <label 
                      htmlFor="imageUpload" 
                      className={`cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}
                    >
                      {uploadingImage ? (
                        <div>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Subiendo imagen...</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl">📷</span>
                          <p className="text-sm text-gray-600 mt-2">Click para subir imagen</p>
                          <p className="text-xs text-gray-400">PNG, JPG hasta 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Imágenes subidas */}
                  {productoForm.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {productoForm.imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={url} 
                            alt={`Producto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarImagen(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sección de sizes y variedades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tallas y Variedades</label>
                  
                  <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                    {/* Selector de talla */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Talla</label>
                      <select 
                        value={variedadForm.selectedSizeId}
                        onChange={(e) => setVariedadForm({...variedadForm, selectedSizeId: e.target.value})}
                        className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                        disabled={loadingSizes}
                      >
                        <option value="">
                          {loadingSizes ? 'Cargando tallas...' : 'Seleccionar talla'}
                        </option>
                        {sizes.map(size => (
                          <option key={size.id} value={size.id}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                      {variedadForm.selectedSizeId && (
                        <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-1 rounded">
                          ID: {variedadForm.selectedSizeId}
                        </div>
                      )}
                    </div>

                    {/* Selector de color */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={variedadForm.color}
                          onChange={(e) => setVariedadForm({...variedadForm, color: e.target.value})}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={variedadForm.color}
                          onChange={(e) => setVariedadForm({...variedadForm, color: e.target.value})}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="#000000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                    </div>

                    {/* Cantidad y precio */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                        <input 
                          type="number" 
                          min="0"
                          value={variedadForm.quantity}
                          onChange={(e) => setVariedadForm({...variedadForm, quantity: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={variedadForm.price}
                          onChange={(e) => setVariedadForm({...variedadForm, price: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSizeSelection}
                      disabled={!variedadForm.selectedSizeId || !variedadForm.color || !variedadForm.quantity || !variedadForm.price}
                      className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Agregar Variedad
                    </button>
                  </div>

                  {/* Variedades agregadas */}
                  {selectedSizes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Variedades agregadas ({selectedSizes.length}):</p>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {selectedSizes.map((size, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-sm">
                                <div className="font-medium text-gray-800">
                                  {getSizeNameById(size.size)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {size.size.substring(0, 8)}...
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: size.color }}
                                  title={size.color}
                                ></div>
                                <span className="text-xs text-gray-600">{size.color}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-green-600 font-medium">${size.price}</span>
                                <span className="text-gray-600 ml-2">({size.quantity}u)</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarSize(size.size, size.color)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6 mt-6 border-t">
              <button
                type="button"
                onClick={handleProductoSubmit}
                disabled={!productoForm.name || !productoForm.categoryId || !productoForm.subcategory || productoForm.imageUrls.length === 0 || selectedSizes.length === 0}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {editingProducto ? 'Actualizar' : 'Crear'} Producto
              </button>
              <button
                type="button"
                onClick={resetProductoForm}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Producto */}
      {showDetalleModal && productoDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Detalle del Producto</h3>
              <button
                onClick={() => setShowDetalleModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información básica */}
              <div>
                <h4 className="text-lg font-semibold mb-4">📋 Información General</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div><strong>Nombre:</strong> {productoDetalle.nombre}</div>
                  <div><strong>Descripción:</strong> {productoDetalle.descripcion}</div>
                  <div><strong>Categoría:</strong> {productoDetalle.categoria}</div>
                  <div><strong>Subcategoría:</strong> {productoDetalle.subcategoria}</div>
                  <div><strong>Estado:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      productoDetalle.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {productoDetalle.estado}
                    </span>
                  </div>
                  <div><strong>Stock Total:</strong> {productoDetalle.stock} unidades</div>
                  <div><strong>Precio Promedio:</strong> ${productoDetalle.precio.toFixed(2)}</div>
                </div>
              </div>

              {/* Imágenes */}
              <div>
                <h4 className="text-lg font-semibold mb-4">🖼️ Imágenes ({(productoDetalle.imagenes || []).length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(productoDetalle.imagenes || []).map((imagen, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={imagen.url} 
                        alt={`${productoDetalle.nombre} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(imagen.url, '_blank')}
                      />
                    </div>
                  ))}
                  {(!productoDetalle.imagenes || productoDetalle.imagenes.length === 0) && (
                    <div className="col-span-2 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🛍️</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variedades */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">🎨 Variedades ({(productoDetalle.variedades || []).length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID Variedad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(productoDetalle.variedades || []).length > 0 ? (productoDetalle.variedades || []).map((variedad, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: variedad.color }}
                              title={variedad.color}
                            ></div>
                            <span className="text-sm">
                              {variedad.color || 'Sin color'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 font-medium text-green-600">
                          ${(variedad.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            (variedad.quantity || 0) > 10 ? 'bg-green-100 text-green-800' :
                            (variedad.quantity || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {variedad.quantity || 0} unidades
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500 font-mono">
                          {(variedad.Id || '').substring(0, 8)}...
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                          No hay variedades disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetalleModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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