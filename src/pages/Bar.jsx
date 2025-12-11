import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiDroplet, 
  FiRefreshCw, 
  FiFilter, 
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiBell,
  FiChevronRight,
  FiZap,
  FiUsers,
  FiStar,
  FiCoffee
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { pedidoService } from '../services/api';
import BarPedidoCard from '../components/bar/BarPedidoCard';
import { toast } from 'react-hot-toast';
import CancelarPedidoModal from '../components/modals/CancelarPedidoModal';

const Bar = () => {
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

  useEffect(() => {
    console.log('📊 DEBUG Bar - Estado actual:', {
      loading,
      pedidosCount: pedidos.length,
      filteredCount: pedidosFiltrados.length
    });
  }, [loading, pedidos, pedidosFiltrados]);

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

  // Cargar pedidos de barra - VERSIÓN CORREGIDA
  const cargarPedidosBarra = useCallback(async () => {
    console.log('🔍 EJECUTANDO cargarPedidosBarra...');
    
    try {
      setRefreshing(true);
      setLoading(true);
      
      const response = await pedidoService.getForBar();
      const pedidosData = response.data;
      
      console.log('✅ Pedidos de barra cargados:', pedidosData.length);
      console.log('📦 Datos crudos:', pedidosData);
      
      // Actualizar AMBOS estados juntos
      setPedidos(pedidosData);
      calcularEstadisticas(pedidosData);
      setUltimaActualizacion(new Date());
      
      toast.success(`${pedidosData.length} pedidos cargados`, {
        icon: '🍹',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
    } catch (error) {
      console.error('❌ Error cargando pedidos de barra:', error);
      console.error('🔧 Error detallado:', error.response?.data || error.message);
      toast.error('Error al cargar los pedidos de barra. Usando datos de prueba.');
      
      // Siempre cargar datos de prueba en desarrollo
      cargarDatosDePrueba();
      
    } finally {
      // Usar timeout como en Mesas.jsx y Cocina.jsx
      setTimeout(() => {
        console.log('🏁 FINALLY: Cambiando loading a FALSE');
        setLoading(false);
        setRefreshing(false);
      }, 0);
    }
  }, []);

  // Calcular estadísticas
  const calcularEstadisticas = (pedidosData) => {
    const pendientes = pedidosData.filter(p => p.estadoBebida === 'pendiente').length;
    const preparando = pedidosData.filter(p => p.estadoBebida === 'preparando').length;
    const listos = pedidosData.filter(p => p.estadoBebida === 'listo').length;
    
    const pedidosPendientes = pedidosData.filter(p => p.estadoBebida === 'pendiente');
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

  // Datos de prueba - VERSIÓN CORREGIDA
  const cargarDatosDePrueba = () => {
    console.log('🔧 Cargando datos de prueba para barra');
    
    const pedidosDePrueba = [
      {
        id: 4,
        mesaId: 2,
        estadoBebida: 'pendiente',
        estadoGeneral: 'pendiente',
        estadoComida: 'pendiente',
        creadoEn: new Date(Date.now() - 10 * 60000).toISOString(),
        detalles: [
          { 
            id: 401,
            itemNombre: 'Jugo de Papaya', 
            cantidad: 2, 
            precioUnitario: 7.00,
            observaciones: null,
            extras: []
          },
          { 
            id: 402,
            itemNombre: 'Coca Cola', 
            cantidad: 1, 
            precioUnitario: 5.00,
            observaciones: null,
            extras: []
          }
        ]
      },
      {
        id: 5,
        mesaId: 4,
        estadoBebida: 'preparando',
        estadoGeneral: 'parcial',
        estadoComida: 'pendiente',
        creadoEn: new Date(Date.now() - 5 * 60000).toISOString(),
        detalles: [
          { 
            id: 501,
            itemNombre: 'Batido de Fresa', 
            cantidad: 1, 
            precioUnitario: 10.00, 
            observaciones: 'Sin azúcar',
            extras: []
          },
          { 
            id: 502,
            itemNombre: 'Café Pasado', 
            cantidad: 2, 
            precioUnitario: 4.00,
            observaciones: null,
            extras: []
          }
        ]
      },
      {
        id: 6,
        mesaId: 3,
        estadoBebida: 'listo',
        estadoGeneral: 'pendiente',
        estadoComida: 'preparando',
        creadoEn: new Date(Date.now() - 20 * 60000).toISOString(),
        detalles: [
          { 
            id: 601,
            itemNombre: 'Mojito', 
            cantidad: 2, 
            precioUnitario: 15.00, 
            observaciones: 'Sin alcohol',
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

  const handleCancelSuccess = async (pedidoId) => {
    try {
      await cargarPedidosBarra();
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
    console.log('🎯 useEffect se ejecutó, cargando pedidos de barra...');
    cargarPedidosBarra();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarPedidosBarra, 30000);
    
    return () => clearInterval(interval);
  }, [cargarPedidosBarra]);

  // Filtrar pedidos
  useEffect(() => {
    console.log('🔍 Ejecutando filtro barra...', { 
      pedidosCount: pedidos.length, 
      filter 
    });
    
    let resultado = [...pedidos];

    if (filter === 'pendientes') {
      resultado = resultado.filter(p => p.estadoBebida === 'pendiente');
    } else if (filter === 'preparando') {
      resultado = resultado.filter(p => p.estadoBebida === 'preparando');
    } else if (filter === 'listos') {
      resultado = resultado.filter(p => p.estadoBebida === 'listo');
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
    console.log('✅ Filtro barra completado:', { 
      original: pedidos.length, 
      filtrado: resultado.length 
    });
  }, [filter, pedidos]);

  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      console.log(`🍺 Actualizando pedido ${pedidoId} (BARRA): ${nuevoEstado}`);
      
      await pedidoService.updateEstadoBar(pedidoId, nuevoEstado);
      
      toast.success(`Pedido #${pedidoId} marcado como ${nuevoEstado}`);
      
      setPedidos(prev => prev.map(pedido =>
        pedido.id === pedidoId
          ? { ...pedido, estadoBebida: nuevoEstado }
          : pedido
      ));
      
    } catch (error) {
      console.error('❌ Error actualizando estado de barra:', error);
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

  console.log('🎨 RENDERIZANDO BAR - loading:', loading, 'pedidos:', pedidos.length);

  // PANTALLA DE LOADING CON BOTÓN DE DEBUG
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Preparando la barra...</h3>
          <p className="text-gray-600 mb-6">Cargando los pedidos de bebidas</p>
          
          {/* BOTÓN DE DEBUG - IGUAL QUE EN MESAS.JSX Y COCINA.JSX */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm font-bold text-blue-800 mb-2">Información de Debug:</p>
            <p className="text-xs text-blue-700 mb-3">
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
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
              >
                Forzar salida de Loading
              </button>
              <button 
                onClick={cargarDatosDePrueba}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg"
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
      className="space-y-8 p-4 md:p-8 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header con gradiente */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
              >
                <FiDroplet className="text-white" size={32} />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Dashboard de Barra</h1>
                <p className="text-xl opacity-90">
                  Gestiona los pedidos de bebidas del restaurante
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
                onClick={cargarPedidosBarra}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg"
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

      {/* Estadísticas */}
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
          className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-cyan-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Preparación</p>
              <p className="text-3xl font-bold text-cyan-600">{estadisticas.preparando}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-xl">
              <FiDroplet className="text-cyan-500 text-xl" />
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
              <FiFilter className="mr-3 text-blue-500" />
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
                        filtro === 'preparando' ? 'bg-cyan-500 text-white shadow-lg' :
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
                {filter === 'pendientes' ? '🎊' : 
                 filter === 'preparando' ? '🍸' : 
                 filter === 'listos' ? '✅' : '🍹'}
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {filter === 'todos' 
                  ? 'No hay pedidos en barra'
                  : `No hay pedidos ${filter} en barra`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter === 'pendientes' 
                  ? '¡Excelente! Todas las bebidas están en proceso.'
                  : filter === 'preparando'
                  ? 'La barra está lista para recibir nuevos pedidos.'
                  : filter === 'listos'
                  ? 'Todos los pedidos están pendientes o en preparación.'
                  : 'Los nuevos pedidos de bebidas aparecerán aquí.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cargarPedidosBarra}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg"
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
                    <BarPedidoCard
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
        className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-xl p-6 text-white"
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
            <h4 className="font-bold text-xl mb-3">Información para la barra:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Actualización automática cada 30 segundos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Bebidas más antiguas primero</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Marca como "Urgente" los cócteles complejos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Verifica siempre las observaciones especiales</span>
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
          area="bar"
          onCancelSuccess={handleCancelSuccess}
        />
      )}
    </motion.div>
  );
};

export default Bar;