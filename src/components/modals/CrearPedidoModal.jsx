import React, { useState, useEffect, useMemo } from 'react'; 
import { 
  FiX, 
  FiShoppingCart, 
  FiCoffee, 
  FiPlus, 
  FiMinus,
  FiTrash2,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiFilter,
  FiStar,
  FiClock,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { itemService, categoriaService, extraService } from '../../services/api';
import ExtraSelector from '../common/ExtraSelector';
import { toast } from 'react-hot-toast';
import ItemCard from '../common/ItemCard';




const CrearPedidoModal = ({ mesa, onClose, onCreate }) => {
  const [paso, setPaso] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [items, setItems] = useState([]);
  const [extras, setExtras] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('nombre');
  
  const [pedido, setPedido] = useState({
    mesaId: mesa.id,
    usuarioId: parseInt(localStorage.getItem('user_id') || '1'),
    detalles: []
  });

   useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar todo en paralelo
        const [catRes, itemsRes, extrasRes] = await Promise.all([
          categoriaService.getAll(),
          itemService.getAll(), 
          extraService.getAll()
        ]);
        
        // PROCESAR SIN getDefaultImage
        const categoriasConSubcategorias = catRes.data.map(categoria => ({
          ...categoria,
          subcategorias: categoria.subcategorias?.map(subcat => ({
            ...subcat,
            items: subcat.items?.filter(item => item.disponible === 1)
            // ¡NO procesar imágenes aquí! Vienen del backend
          })).filter(subcat => subcat.items?.length > 0)
        })).filter(categoria => categoria.subcategorias?.length > 0);
        
        setCategorias(categoriasConSubcategorias);
        
        // Procesar items para búsqueda
        const todosLosItems = [];
        categoriasConSubcategorias.forEach(categoria => {
          categoria.subcategorias?.forEach(subcategoria => {
            subcategoria.items?.forEach(item => {
              todosLosItems.push({
                ...item, // ← item YA tiene imagenUrl del backend
                categoria: {
                  id: categoria.id,
                  nombre: categoria.nombre
                },
                subcategoria: {
                  id: subcategoria.id,
                  nombre: subcategoria.nombre,
                  categoria: {
                    id: categoria.id,
                    nombre: categoria.nombre
                  }
                }
              });
            });
          });
        });
        
        setItems(todosLosItems);
        setExtras(extrasRes.data || []);
        
        if (categoriasConSubcategorias.length > 0) {
          const primeraCategoria = categoriasConSubcategorias[0];
          setCategoriaActiva(primeraCategoria.id);
          if (primeraCategoria.subcategorias?.length > 0) {
            setSubcategoriaActiva(primeraCategoria.subcategorias[0].id);
          }
        }
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar el menú');
      } finally {
        setLoading(false);
      } 
    };

    cargarDatos();
  }, []);

  // Filtrar items según búsqueda y orden
  const itemsFiltrados = React.useMemo(() => {
    let filtrados = items;
    
    // Filtrar por categoría activa
    if (categoriaActiva) {
      filtrados = filtrados.filter(item => item.categoria?.id === categoriaActiva);
    }
    
    // Filtrar por subcategoría activa
    if (subcategoriaActiva) {
      filtrados = filtrados.filter(item => item.subcategoria?.id === subcategoriaActiva);
    }
    
    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(item => 
        item.nombre.toLowerCase().includes(termino) ||
        item.descripcion?.toLowerCase().includes(termino) ||
        item.subcategoria?.nombre.toLowerCase().includes(termino)
      );
    }
    
    // Ordenar
    switch (orden) {
      case 'precio-asc':
        return [...filtrados].sort((a, b) => (a.precio || 0) - (b.precio || 0));
      case 'precio-desc':
        return [...filtrados].sort((a, b) => (b.precio || 0) - (a.precio || 0));
      case 'nombre':
      default:
        return [...filtrados].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }
  }, [items, categoriaActiva, subcategoriaActiva, busqueda, orden]);

  // Obtener categoría actual
  const categoriaActual = categorias.find(c => c.id === categoriaActiva);
  // Obtener subcategorías de la categoría actual
  const subcategoriasActuales = categoriaActual?.subcategorias || [];

  // Funciones de cálculo
  const calcularSubtotalDetalle = (detalle) => {
    const itemOriginal = items.find(i => i.id === detalle.itemId);
    
    let precioUnitarioBase = 0;
    if (itemOriginal?.precio) {
      precioUnitarioBase = itemOriginal.precio;
    } else if (detalle.precioUnitario) {
      precioUnitarioBase = detalle.precioUnitario;
    }
    
    const cantidad = detalle.cantidad || 1;
    const subtotalBase = precioUnitarioBase * cantidad;

    let subtotalExtras = 0;
    if (detalle.extras && Array.isArray(detalle.extras)) {
      detalle.extras.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) {
          const precioExtra = extra.precio || extra.precioUnitario || 0;
          subtotalExtras += precioExtra * cantidad;
        }
      });
    }

    return subtotalBase + subtotalExtras;
  };

  const calcularTotal = () => {
    if (!pedido.detalles || pedido.detalles.length === 0) return 0;
    return pedido.detalles.reduce((total, detalle) => {
      return total + calcularSubtotalDetalle(detalle);
    }, 0);
  };

  const agregarItem = (item) => {
    if (item.stock !== undefined && item.stock <= 0) {
      toast.error(`❌ ${item.nombre} está agotado`);
      return;
    }

    setPedido(prev => {
      const detalles = [...prev.detalles];
      const existenteIndex = detalles.findIndex(d => d.itemId === item.id);

      if (existenteIndex >= 0) {
        if (item.stock !== undefined && detalles[existenteIndex].cantidad >= item.stock) {
          toast.error(`⚠️ Stock máximo: ${item.stock} unidades`);
          return prev;
        }

        detalles[existenteIndex] = {
          ...detalles[existenteIndex],
          cantidad: detalles[existenteIndex].cantidad + 1,
          precioUnitario: item.precio || detalles[existenteIndex].precioUnitario || 0
        };
      } else {
        detalles.push({
          itemId: item.id,
          itemNombre: item.nombre,
          precioUnitario: item.precio || 0,
          cantidad: 1,
          observaciones: '',
          extras: [],
          stockDisponible: item.stock,
          imagen_url: item.imagen_url // Guardar también la imagen
        });
      }

      return { ...prev, detalles };
    });

    toast.success(`✅ ${item.nombre} agregado`);
  };

  const removerItem = (itemId) => {
    setPedido(prev => {
      const detalles = [...prev.detalles];
      const existenteIndex = detalles.findIndex(d => d.itemId === itemId);
      
      if (existenteIndex >= 0) {
        if (detalles[existenteIndex].cantidad > 1) {
          detalles[existenteIndex] = {
            ...detalles[existenteIndex],
            cantidad: detalles[existenteIndex].cantidad - 1
          };
        } else {
          detalles.splice(existenteIndex, 1);
        }
      }
      
      return { ...prev, detalles };
    });
  };

  const actualizarExtras = (itemId, nuevosExtras) => {
    setPedido(prev => ({
      ...prev,
      detalles: prev.detalles.map(detalle =>
        detalle.itemId === itemId
          ? { ...detalle, extras: nuevosExtras }
          : detalle
      )
    }));
  };

  const actualizarObservaciones = (itemId, texto) => {
    setPedido(prev => ({
      ...prev,
      detalles: prev.detalles.map(detalle =>
        detalle.itemId === itemId
          ? { ...detalle, observaciones: texto }
          : detalle
      )
    }));
  };

  const eliminarItem = (itemId) => {
    const item = pedido.detalles.find(d => d.itemId === itemId);
    if (item) {
      setPedido(prev => ({
        ...prev,
        detalles: prev.detalles.filter(d => d.itemId !== itemId)
      }));
      toast.success(`🗑️ ${item.itemNombre} eliminado`);
    }
  };

  const handleSubmit = async () => {
    if (pedido.detalles.length === 0) {
      toast.error('Agrega al menos un item al pedido');
      return;
    }

    const pedidoData = {
      mesaId: mesa.id,
      usuarioId: pedido.usuarioId,
      detalles: pedido.detalles.map(detalle => {
        const itemCompleto = items.find(i => i.id === detalle.itemId);
        
        return {
          itemId: detalle.itemId,
          cantidad: detalle.cantidad,
          precioUnitario: itemCompleto?.precio || detalle.precioUnitario || 0,
          observaciones: detalle.observaciones,
          extras: detalle.extras || []
        };
      }),
      total: calcularTotal()
    };

    try {
      toast.loading('Creando pedido...', { id: 'crear-pedido' });
      await onCreate(pedidoData);
      toast.dismiss('crear-pedido');
    } catch (error) {
      toast.dismiss('crear-pedido');
      console.error('Error enviando pedido:', error);
    }
  };

  

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Cargando Menú</h3>
          <p className="text-gray-600">Preparando una experiencia culinaria...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <FiShoppingCart className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Nuevo Pedido - Mesa #{mesa.numero}
              </h2>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2].map((num) => (
                      <div
                        key={num}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          num === paso ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    Paso {paso} de 2: {paso === 1 ? 'Seleccionar Items' : 'Revisar Pedido'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FiClock size={14} />
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition"
          >
            <FiX size={24} />
          </motion.button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden flex">
          {/* Panel izquierdo - Menú (solo en paso 1) */}
          {paso === 1 && (
            <div className="w-2/3 border-r border-gray-200 flex flex-col">
              {/* Barra de búsqueda y filtros */}
              <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center space-x-4">
                  {/* Búsqueda */}
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre, descripción o categoría..."
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  
                  {/* Orden */}
                  <div className="relative">
                    <select
                      value={orden}
                      onChange={(e) => setOrden(e.target.value)}
                      className="appearance-none pl-10 pr-8 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="nombre">Ordenar por nombre</option>
                      <option value="precio-asc">Precio: Menor a Mayor</option>
                      <option value="precio-desc">Precio: Mayor a Menor</option>
                    </select>
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                {/* Categorías */}
                <div className="mt-6">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {categorias.map((categoria) => (
                      <motion.button
                        key={categoria.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCategoriaActiva(categoria.id);
                          const primeraSubcat = categoria.subcategorias?.[0];
                          if (primeraSubcat) {
                            setSubcategoriaActiva(primeraSubcat.id);
                          }
                        }}
                        className={`px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                          categoriaActiva === categoria.id
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="font-medium">{categoria.nombre}</span>
                        <span className="ml-2 text-xs opacity-75">
                          ({categoria.subcategorias?.reduce((sum, sc) => sum + (sc.items?.length || 0), 0)})
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Subcategorías */}
                  {subcategoriasActuales.length > 0 && (
                    <div className="mt-4 flex space-x-2 overflow-x-auto">
                      {subcategoriasActuales.map((subcategoria) => (
                        <button
                          key={subcategoria.id}
                          onClick={() => setSubcategoriaActiva(subcategoria.id)}
                          className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                            subcategoriaActiva === subcategoria.id
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {subcategoria.nombre}
                          <span className="ml-2 text-xs">
                            ({subcategoria.items?.length || 0})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de items organizada */}
              <div className="flex-1 overflow-y-auto p-8">
                <AnimatePresence>
                  {itemsFiltrados.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="text-gray-300 text-7xl mb-6">🍽️</div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">
                        No se encontraron items
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {busqueda
                          ? `No hay resultados para "${busqueda}". Intenta con otro término.`
                          : `No hay items disponibles en ${categoriaActual?.nombre || 'esta categoría'}.`}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {itemsFiltrados.map((item) => {
                        const detalle = pedido.detalles.find(d => d.itemId === item.id);
                        const cantidad = detalle?.cantidad || 0;
                        
                        return (
                          <ItemCard
                            key={item.id}
                            item={item}
                            cantidad={cantidad}
                            onAddToOrder={agregarItem}
                            onRemoveFromOrder={removerItem}
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Contador de items */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                    Mostrando <span className="font-bold text-blue-600">{itemsFiltrados.length}</span> de{' '}
                    <span className="font-bold">{items.length}</span> items disponibles
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Panel derecho - Resumen del pedido */}
          <div className={`${paso === 1 ? 'w-1/3' : 'w-full'} flex flex-col bg-gradient-to-b from-gray-50 to-white`}>
            {/* Header del resumen */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {paso === 1 ? 'Tu Pedido' : 'Confirmar Pedido'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {paso === 1 ? 'Revisa y personaliza tu selección' : 'Verifica todos los detalles antes de confirmar'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {pedido.detalles.length} {pedido.detalles.length === 1 ? 'item' : 'items'}
                  </span>
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg">
                    {pedido.detalles.reduce((total, d) => total + d.cantidad, 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de items en el pedido */}
            <div className="flex-1 overflow-y-auto p-6">
              {pedido.detalles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-300 text-6xl mb-4">🛒</div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Tu pedido está vacío
                  </h4>
                  <p className="text-gray-600">
                    Agrega items del menú para comenzar
                  </p>
                  <div className="mt-6 animate-bounce">
                    <FiChevronLeft className="text-blue-500 text-2xl mx-auto" />
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {pedido.detalles.map((detalle) => (
                    <motion.div
                      key={detalle.itemId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{detalle.itemNombre}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-gray-600">
                              S/ {detalle.precioUnitario.toFixed(2)} c/u
                            </span>
                            {detalle.stockDisponible !== undefined && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                detalle.stockDisponible < 5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                              }`}>
                                Stock: {detalle.stockDisponible}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => removerItem(detalle.itemId)}
                              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
                            >
                              <FiMinus size={18} />
                            </button>
                            <span className="font-bold text-xl min-w-[40px] text-center">
                              {detalle.cantidad}
                            </span>
                            <button
                              onClick={() => {
                                const item = items.find(i => i.id === detalle.itemId);
                                if (item) agregarItem(item);
                              }}
                              className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition"
                            >
                              <FiPlus size={18} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => eliminarItem(detalle.itemId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Extras */}
                      <div className="mb-4">
                        <ExtraSelector
                          extras={extras}
                          seleccionados={detalle.extras}
                          onChange={(nuevosExtras) => 
                            actualizarExtras(detalle.itemId, nuevosExtras)
                          }
                        />
                      </div>

                      {/* Observaciones */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <FiStar className="mr-2 text-yellow-500" size={14} />
                            Observaciones especiales:
                          </div>
                        </label>
                        <textarea
                          value={detalle.observaciones}
                          onChange={(e) => 
                            actualizarObservaciones(detalle.itemId, e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          rows="2"
                          placeholder="¿Alguna especificación especial para este item?"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                        <span className="font-bold text-lg">
                          Subtotal: S/ {calcularSubtotalDetalle(detalle).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Total y acciones */}
            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
              {/* Resumen */}
              <div className="mb-6 p-4 bg-white rounded-2xl shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-800">Resumen del Pedido</p>
                    <p className="text-sm text-gray-600">
                      Mesa #{mesa.numero} • {pedido.detalles.length} items
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                    <FiCheck className="text-green-600" size={24} />
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center py-4 border-t border-b border-gray-200">
                  <div>
                    <p className="font-bold text-gray-800">Total a pagar</p>
                    <p className="text-sm text-gray-600">Incluye items y extras</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      S/ {calcularTotal().toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pedido.detalles.reduce((total, d) => total + d.cantidad, 0)} unidades
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de navegación */}
              <div className="flex justify-between">
                {paso === 1 ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                      Cancelar
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (pedido.detalles.length === 0) {
                          toast.error('Agrega al menos un item para continuar');
                          return;
                        }
                        setPaso(2);
                      }}
                      disabled={pedido.detalles.length === 0}
                      className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continuar al Resumen</span>
                      <FiChevronRight />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPaso(1)}
                      className="flex items-center space-x-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                      <FiChevronLeft />
                      <span>Modificar Pedido</span>
                    </motion.button>
                    
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                      >
                        Cancelar
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={pedido.detalles.length === 0}
                        className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        <FiShoppingCart />
                        <span className="font-bold">Confirmar Pedido</span>
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPedidoModal;