import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCoffee, 
  FiRefreshCw, 
  FiFilter, 
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiBell,
  FiChevronRight,
  FiZap,
  FiUser,
  FiHome,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { pedidoService } from '../services/api';
import CocinaPedidoCard from '../components/cocina/CocinaPedidoCard';
import { toast } from 'react-hot-toast';
import CancelarPedidoModal from '../components/modals/CancelarPedidoModal';

const Cocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendientes');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    preparando: 0,
    listos: 0,
    tiempoPromedio: 0
  });
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Cargar pedidos de cocina - VERSIÓN MEJORADA CON useCallback
  const cargarPedidosCocina = useCallback(async () => {
    console.log('🔍 EJECUTANDO cargarPedidosCocina...');
    
    try {
      setRefreshing(true);
      setLoading(true);
      
      const response = await pedidoService.getForCocina();
      const pedidosData = response.data;
      
      console.log('✅ Pedidos cargados:', pedidosData.length);
      console.log('📦 Datos crudos:', pedidosData);
      
      // Actualizar AMBOS estados juntos
      setPedidos(pedidosData);
      calcularEstadisticas(pedidosData);
      setUltimaActualizacion(new Date());
      
      toast.success(`${pedidosData.length} pedidos cargados`, {
        icon: '🍳',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
    } catch (error) {
      console.error('❌ Error cargando pedidos de cocina:', error);
      console.error('🔧 Error detallado:', error.response?.data || error.message);
      toast.error('Error al cargar los pedidos. Usando datos de prueba.');
      
      // Siempre cargar datos de prueba en desarrollo
      cargarDatosDePrueba();
      
    } finally {
      // Usar timeout como en Mesas.jsx para forzar render
      setTimeout(() => {
        console.log('🏁 FINALLY: Cambiando loading a FALSE');
        setLoading(false);
        setRefreshing(false);
      }, 0);
    }
  }, []);

  // Datos de prueba - VERSIÓN MEJORADA
  const cargarDatosDePrueba = () => {
    console.log('🔧 Cargando datos de prueba para desarrollo');
    
    const pedidosDePrueba = [
      {
        id: 1,
        mesaId: 3,
        estadoComida: 'pendiente',
        estadoGeneral: 'pendiente',
        estadoBebida: 'pendiente',
        creadoEn: new Date(Date.now() - 15 * 60000).toISOString(),
        detalles: [
          { 
            id: 101,
            itemNombre: 'Lomo Saltado', 
            cantidad: 2, 
            precioUnitario: 22.00, 
            observaciones: 'Sin cebolla',
            extras: []
          },
          { 
            id: 102,
            itemNombre: 'Arroz Chaufa', 
            cantidad: 1, 
            precioUnitario: 17.00,
            observaciones: null,
            extras: []
          }
        ]
      },
      {
        id: 2,
        mesaId: 5,
        estadoComida: 'preparando',
        estadoGeneral: 'preparando',
        estadoBebida: 'listo',
        creadoEn: new Date(Date.now() - 8 * 60000).toISOString(),
        detalles: [
          { 
            id: 201,
            itemNombre: 'Pollo a la Plancha', 
            cantidad: 1, 
            precioUnitario: 18.00, 
            observaciones: 'Bien cocido',
            extras: []
          }
        ]
      },
      {
        id: 3,
        mesaId: 2,
        estadoComida: 'listo',
        estadoGeneral: 'parcial',
        estadoBebida: 'pendiente',
        creadoEn: new Date(Date.now() - 25 * 60000).toISOString(),
        detalles: [
          { 
            id: 301,
            itemNombre: 'Papa a la Huancaína', 
            cantidad: 1, 
            precioUnitario: 12.00,
            observaciones: null,
            extras: []
          },
          { 
            id: 302,
            itemNombre: 'Bistec con Arroz', 
            cantidad: 1, 
            precioUnitario: 20.00, 
            observaciones: 'Poco hecho',
            extras: []
          }
        ]
      }
    ];
    
    console.log('📦 Datos mock establecidos:', pedidosDePrueba.length, 'pedidos');
    setPedidos(pedidosDePrueba);
    calcularEstadisticas(pedidosDePrueba);
    setUltimaActualizacion(new Date());
    
    // IMPORTANTE: Cambiar loading a false
    setLoading(false);
  };

  // Calcular estadísticas
  const calcularEstadisticas = (pedidosData) => {
    const pendientes = pedidosData.filter(p => p.estadoComida === 'pendiente').length;
    const preparando = pedidosData.filter(p => p.estadoComida === 'preparando').length;
    const listos = pedidosData.filter(p => p.estadoComida === 'listo').length;
    
    const pedidosPendientes = pedidosData.filter(p => p.estadoComida === 'pendiente');
    let tiempoTotal = 0;
    
    pedidosPendientes.forEach(pedido => {
      try {
        const creado = new Date(pedido.creadoEn);
        const ahora = new Date();
        tiempoTotal += Math.floor((ahora - creado) / (1000 * 60));
      } catch (error) {
        console.error('Error calculando tiempo:', error);
      }
    });
    
    const tiempoPromedio = pedidosPendientes.length > 0 
      ? Math.round(tiempoTotal / pedidosPendientes.length) 
      : 0;
    
    setEstadisticas({
      total: pedidosData.length,
      pendientes,
      preparando,
      listos,
      tiempoPromedio
    });
  };

  const handleCancelSuccess = async (pedidoId) => {
    try {
      await cargarPedidosCocina();
      toast.success(`Pedido #${pedidoId} eliminado de la lista`);
    } catch (error) {
      console.error('Error después de cancelar:', error);
    }
  };

  const handleAbrirCancelacion = (pedido) => {
    setPedidoACancelar(pedido);
  };

  // useEffect para cargar inicialmente
  useEffect(() => {
    console.log('🎯 useEffect se ejecutó, cargando pedidos...');
    cargarPedidosCocina();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarPedidosCocina, 30000);
    
    return () => clearInterval(interval);
  }, [cargarPedidosCocina]);

  // Filtrar pedidos
  useEffect(() => {
    console.log('🔍 Ejecutando filtro...', { 
      pedidosCount: pedidos.length, 
      filter 
    });
    
    let resultado = [...pedidos];

    if (filter === 'pendientes') {
      resultado = resultado.filter(p => p.estadoComida === 'pendiente');
    } else if (filter === 'preparando') {
      resultado = resultado.filter(p => p.estadoComida === 'preparando');
    } else if (filter === 'listos') {
      resultado = resultado.filter(p => p.estadoComida === 'listo');
    }
    
    // Ordenar por fecha
    resultado.sort((a, b) => {
      try {
        const tiempoA = new Date(a.creadoEn);
        const tiempoB = new Date(b.creadoEn);
        return tiempoA - tiempoB;
      } catch {
        return 0;
      }
    });
    
    setPedidosFiltrados(resultado);
    console.log('✅ Filtro completado:', { 
      original: pedidos.length, 
      filtrado: resultado.length 
    });
  }, [filter, pedidos]);

  // DEBUG: Ver estados actualizados
  useEffect(() => {
    console.log('📊 Estado actualizado Cocina:', {
      loading,
      pedidosCount: pedidos.length,
      filteredCount: pedidosFiltrados.length,
      estadisticas
    });
  }, [loading, pedidos, pedidosFiltrados, estadisticas]);

  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      console.log(`🔄 Actualizando pedido ${pedidoId} a estado: ${nuevoEstado}`);
      
      await pedidoService.updateEstadoCocina(pedidoId, nuevoEstado);
      
      toast.success(`Pedido #${pedidoId} marcado como ${nuevoEstado}`);
      
      setPedidos(prev => prev.map(pedido =>
        pedido.id === pedidoId
          ? { ...pedido, estadoComida: nuevoEstado }
          : pedido
      ));
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      toast.error('Error al actualizar el estado del pedido');
    }
  };

  const formatearUltimaActualizacion = () => {
    if (!ultimaActualizacion) return '--:--';
    
    const ahora = new Date();
    const diff = Math.floor((ahora - ultimaActualizacion) / 1000);
    
    if (diff < 60) return 'Hace unos segundos';
    if (diff < 120) return 'Hace 1 minuto';
    return `Hace ${Math.floor(diff / 60)} minutos`;
  };

  console.log('🎨 RENDERIZANDO COCINA - loading:', loading, 'pedidos:', pedidos.length);

  // PANTALLA DE LOADING CON BOTÓN DE DEBUG
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Preparando la cocina...</h3>
          <p className="text-gray-600 mb-6">Cargando los pedidos más recientes</p>
          
          {/* BOTÓN DE DEBUG - IGUAL QUE EN MESAS.JSX */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm font-bold text-yellow-800 mb-2">Información de Debug:</p>
            <p className="text-xs text-yellow-700 mb-3">
              • Loading activo: {loading.toString()}<br/>
              • Pedidos cargados: {pedidos.length}<br/>
              • Última actualización: {ultimaActualizacion ? 'Sí' : 'No'}<br/>
              • Filtro activo: {filter}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  console.log('🔄 Forzando loading a false...');
                  setLoading(false);
                }}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg"
              >
                Forzar salida de Loading
              </button>
              <button 
                onClick={cargarDatosDePrueba}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
              >
                Cargar datos prueba
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 p-4 md:p-8 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header con gradiente */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
              >
                <FiCoffee className="text-white" size={32} />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Dashboard de Cocina</h1>
                <p className="text-xl opacity-90">
                  Gestiona los pedidos de comida del restaurante
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="text-right bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-sm opacity-80">Última actualización</p>
                <p className="text-xl font-bold">{formatearUltimaActualizacion()}</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cargarPedidosCocina}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg"
              >
                {refreshing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiRefreshCw />
                  </motion.div>
                ) : (
                  <FiRefreshCw />
                )}
                <span>Actualizar</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas con animaciones */}
      <motion.div 
        variants={containerVariants} 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
              <p className="text-3xl font-bold">{estadisticas.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiTrendingUp className="text-blue-500 text-xl" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <FiClock className="text-yellow-500 text-xl" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Preparación</p>
              <p className="text-3xl font-bold text-orange-600">{estadisticas.preparando}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <FiCoffee className="text-orange-500 text-xl" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Listos</p>
              <p className="text-3xl font-bold text-green-600">{estadisticas.listos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-purple-600">{estadisticas.tiempoPromedio} min</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FiAlertTriangle className="text-purple-500 text-xl" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filtros */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl shadow-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
              <FiFilter className="mr-3 text-orange-500" />
              Filtrar pedidos
            </h3>
            <div className="flex flex-wrap gap-3">
              {['todos', 'pendientes', 'preparando', 'listos'].map((filtro) => (
                <motion.button
                  key={filtro}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(filtro)}
                  className={`px-5 py-2.5 rounded-xl transition-all font-medium ${
                    filter === filtro
                      ? filtro === 'todos' ? 'bg-blue-500 text-white shadow-lg' :
                        filtro === 'pendientes' ? 'bg-yellow-500 text-white shadow-lg' :
                        filtro === 'preparando' ? 'bg-orange-500 text-white shadow-lg' :
                        'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filtro === 'todos' ? 'Todos' : 
                   filtro === 'pendientes' ? 'Pendientes' :
                   filtro === 'preparando' ? 'En Preparación' : 'Listos'}
                  <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-sm">
                    {estadisticas[filtro === 'todos' ? 'total' : filtro]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
          </div>
        </div>
      </motion.div>

      {/* Lista de pedidos */}
      <motion.div variants={itemVariants}>
        <AnimatePresence>
          {pedidosFiltrados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl p-12 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                {filter === 'pendientes' ? '🎉' : 
                 filter === 'preparando' ? '👨‍🍳' : 
                 filter === 'listos' ? '✅' : '🍳'}
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {filter === 'todos' 
                  ? 'No hay pedidos en cocina'
                  : `No hay pedidos ${filter}`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter === 'pendientes' 
                  ? '¡Excelente trabajo! Todos los pedidos están en proceso.'
                  : filter === 'preparando'
                  ? 'La cocina está lista para recibir nuevos pedidos.'
                  : filter === 'listos'
                  ? 'Todos los pedidos están pendientes o en preparación.'
                  : 'Los nuevos pedidos aparecerán aquí automáticamente.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cargarPedidosCocina}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg"
              >
                <FiRefreshCw />
                <span>Recargar pedidos</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {pedidosFiltrados.map((pedido, index) => (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CocinaPedidoCard
                      pedido={pedido}
                      onUpdateEstado={actualizarEstadoPedido}
                      onCancelSuccess={() => handleAbrirCancelacion(pedido)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer con información */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl shadow-xl p-6 text-white"
      >
        <div className="flex items-start">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4"
          >
            <FiBell className="text-white" />
          </motion.div>
          <div>
            <h4 className="font-bold text-xl mb-3">Información para la cocina:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Actualización automática cada 30 segundos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Pedidos antiguos primero</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Pedidos rojos: más de 20 minutos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Marca como "Urgente" si es prioritario</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de cancelación */}
      {pedidoACancelar && (
        <CancelarPedidoModal
          isOpen={!!pedidoACancelar}
          onClose={() => setPedidoACancelar(null)}
          pedido={pedidoACancelar}
          area="cocina"
          onCancelSuccess={handleCancelSuccess}
        />
      )}
    </motion.div>
  );
};

export default Cocina;