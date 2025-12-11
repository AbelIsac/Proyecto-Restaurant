// Dashboard.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mesaService, pedidoService, healthCheck, stockService } from '../services/api';
import { 
  FiCoffee, 
  FiShoppingCart, 
  FiClock, 
  FiCheckCircle,
  FiAlertTriangle,
  FiActivity,
  FiWifi,
  FiWifiOff,
  FiUser,
  FiTrendingUp,
  FiPackage,
  FiBarChart2,
  FiDollarSign,
  FiUsers,
  FiHeart,
  FiStar,
  FiAward,
  FiZap,
  FiBell,
  FiChevronRight,
  FiChevronLeft,
  FiHome,
  FiList,
  FiPlus,
  FiBook,
  FiBox,
  FiSettings
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    mesas: 0,
    pedidosActivos: 0,
    pedidosPendientes: 0,
    conexion: null,
    alertasStock: 0,
    ventasHoy: 0,
    itemsVendidos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5 // Todas juntas en 0.5 segundos
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
        stiffness: 100,
        damping: 10
      }
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Verificar conexión
        toast.loading('Actualizando dashboard...', { id: 'dashboard-loading' });
        
        const health = await healthCheck();
        
        if (!health.success) {
          setStats(prev => ({ ...prev, conexion: false }));
          setError(health.message);
          toast.dismiss('dashboard-loading');
          toast.error('⚠️ Conexión perdida');
          setLoading(false);
          return;
        }

        // Cargar datos principales
        const [mesasData, pedidosData, stockData] = await Promise.allSettled([
          mesaService.getAll(),
          pedidoService.getActivos(),
          stockService.getReport()
        ]);

        // Procesar datos
        const mesas = mesasData.status === 'fulfilled' ? mesasData.value.data?.length || 0 : 0;
        const pedidos = pedidosData.status === 'fulfilled' ? pedidosData.value.data || [] : [];
        
        // Calcular pendientes
        const pendientes = pedidos.filter(p => 
          p.estadoGeneral === 'pendiente' || 
          p.estadoComida === 'pendiente' || 
          p.estadoBebida === 'pendiente'
        ).length || 0;

        // Calcular alertas de stock
        let alertasStock = 0;
        if (stockData.status === 'fulfilled') {
          alertasStock = stockData.value.data?.filter(item => 
            item.estadoStock === 'critico' || item.estadoStock === 'agotado'
          ).length || 0;
        }

        // Calcular ventas hoy (simulado)
        const ventasHoy = pedidos.reduce((total, pedido) => {
          return total + (pedido.total || 0);
        }, 0);

        // Calcular items vendidos hoy
        const itemsVendidos = pedidos.reduce((total, p) => 
          total + (p.detalles?.reduce((sum, d) => sum + (d.cantidad || 0), 0) || 0), 0
        );

        // Actualizar estado
        setStats({
          mesas,
          pedidosActivos: pedidos.length,
          pedidosPendientes: pendientes,
          conexion: true,
          alertasStock,
          ventasHoy,
          itemsVendidos
        });

        // Generar notificaciones
        const nuevasNotificaciones = [];
        if (alertasStock > 0) {
          nuevasNotificaciones.push({
            id: 'stock-alert',
            tipo: 'advertencia',
            mensaje: `${alertasStock} items con stock crítico`,
            icono: <FiPackage />,
            color: 'bg-red-100 text-red-800'
          });
        }
        
        if (pendientes > 5) {
          nuevasNotificaciones.push({
            id: 'pedidos-pendientes',
            tipo: 'info',
            mensaje: `${pendientes} pedidos pendientes`,
            icono: <FiClock />,
            color: 'bg-orange-100 text-orange-800'
          });
        }
        
        if (user?.rol === 'mozo' && mesas > 0) {
          nuevasNotificaciones.push({
            id: 'mesas-disponibles',
            tipo: 'success',
            mensaje: `${mesas} mesas disponibles`,
            icono: <FiCoffee />,
            color: 'bg-green-100 text-green-800'
          });
        }

        setNotificaciones(nuevasNotificaciones);
        setError(null);
        toast.dismiss('dashboard-loading');
        toast.success('✅ Dashboard actualizado');
        
      } catch (err) {
        console.error('Error en dashboard:', err);
        setStats(prev => ({ ...prev, conexion: false }));
        setError(err.message || 'Error desconocido');
        toast.dismiss('dashboard-loading');
        toast.error('❌ Error cargando dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadDashboard, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Info según rol
  const getRoleInfo = () => {
    const roles = {
      'mozo': { 
        color: 'from-blue-500 to-blue-600',
        icon: '👨‍💼',
        acciones: [
          { nombre: 'Mesas', icono: '🏠', desc: 'Ver y gestionar mesas', url: '/mesas' },
          { nombre: 'Pedidos', icono: '🛒', desc: 'Gestionar pedidos', url: '/pedidos' },
          { nombre: 'Nuevo Pedido', icono: '➕', desc: 'Crear nuevo pedido', url: '/mesas' }
        ]
      },
      'cocina': { 
        color: 'from-orange-500 to-red-500',
        icon: '👨‍🍳',
        acciones: [
          { nombre: 'Pedidos Cocina', icono: '🍳', desc: 'Ver pedidos de cocina', url: '/cocina' },
          { nombre: 'Recetas', icono: '📋', desc: 'Ver recetas', url: '#' },
          { nombre: 'Inventario', icono: '📦', desc: 'Ver stock', url: '#' }
        ]
      },
      'barra': { 
        color: 'from-purple-500 to-pink-500',
        icon: '🍸',
        acciones: [
          { nombre: 'Pedidos Barra', icono: '🍹', desc: 'Ver pedidos de barra', url: '/bar' },
          { nombre: 'Bebidas', icono: '🥤', desc: 'Ver menú de bebidas', url: '#' },
          { nombre: 'Stock', icono: '📊', desc: 'Control de stock', url: '#' }
        ]
      },
      'admin': { 
        color: 'from-emerald-500 to-teal-600',
        icon: '👑',
        acciones: [
          { nombre: 'Dashboard', icono: '📈', desc: 'Ver estadísticas', url: '/admin' },
          { nombre: 'Usuarios', icono: '👥', desc: 'Gestionar usuarios', url: '/usuarios' },
          { nombre: 'Reportes', icono: '📊', desc: 'Ver reportes', url: '/reportes' }
        ]
      }
    };
    
    return roles[user?.rol] || roles['mozo'];
  };

  const roleInfo = getRoleInfo();

  // Componente de tarjeta animada
  const StatCard = ({ titulo, valor, icono, color, subtexto }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`relative bg-white rounded-2xl shadow-xl p-6 border-l-4 ${color} overflow-hidden group`}
    >
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{titulo}</p>
          <p className="text-3xl font-bold text-gray-800">{valor}</p>
          {subtexto && <p className="text-xs text-gray-500 mt-2">{subtexto}</p>}
        </div>
        <div className="p-3 bg-gradient-to-br from-white/20 to-white/0 rounded-full">
          {icono}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-6"
        ></motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg font-semibold text-gray-700"
        >
          Preparando tu dashboard...
        </motion.p>
        <p className="text-sm text-gray-500 mt-2 animate-pulse">
          Cargando datos en tiempo real
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header principal con gradiente */}
      <motion.div 
        variants={itemVariants}
        className={`bg-gradient-to-r ${roleInfo.color} rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden`}
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block text-4xl mb-4"
              >
                {roleInfo.icon}
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                ¡Hola, <span className="text-yellow-300">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>!
              </h1>
              <p className="text-xl opacity-90">
                {user?.rol === 'mozo' && '🍽️ Gestiona el restaurante con estilo'}
                {user?.rol === 'cocina' && '🔥 Cocina con pasión y precisión'}
                {user?.rol === 'barra' && '🍹 Prepara las mejores bebidas'}
                {user?.rol === 'admin' && '👑 Administra todo el sistema'}
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="mt-6 md:mt-0 bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/30 rounded-xl">
                  <FiUser size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg">{user?.nombre}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    user?.rol === 'mozo' ? 'bg-blue-500/30' :
                    user?.rol === 'cocina' ? 'bg-orange-500/30' :
                    user?.rol === 'barra' ? 'bg-purple-500/30' :
                    'bg-emerald-500/30'
                  }`}>
                    {user?.rol?.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Notificaciones rápidas */}
      {notificaciones.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notificaciones.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl shadow-lg ${notif.color} flex items-center space-x-3`}
            >
              <div className="text-xl">{notif.icono}</div>
              <div>
                <p className="font-medium">{notif.mensaje}</p>
                <p className="text-sm opacity-80">Haz clic para ver detalles</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      

    {/* Estadísticas principales - ANIMACIÓN SIMULTÁNEA */}
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Tarjeta 1: Estado del Sistema */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.03, y: -5 }}
        className="relative bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 overflow-hidden group"
      >
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Estado del Sistema</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.conexion ? '✅ Operativo' : '❌ Desconectado'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {error || 'Conectado al backend'}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white/20 to-white/0 rounded-full">
            {stats.conexion ? (
              <FiWifi className="text-green-500 text-xl" />
            ) : (
              <FiWifiOff className="text-red-500 text-xl" />
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Tarjeta 2: Total Mesas */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.03, y: -5 }}
        className="relative bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500 overflow-hidden group"
      >
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Mesas</p>
            <p className="text-3xl font-bold text-gray-800">{stats.mesas}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.mesas > 0 
                ? `${Math.round((stats.pedidosActivos / stats.mesas) * 100) || 0}% ocupación`
                : 'Sin mesas registradas'}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white/20 to-white/0 rounded-full">
            <FiCoffee className="text-blue-500 text-xl" />
          </div>
        </div>
      </motion.div>
      
      {/* Tarjeta 3: Pedidos Activos */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.03, y: -5 }}
        className="relative bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500 overflow-hidden group"
      >
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pedidos Activos</p>
            <p className="text-3xl font-bold text-gray-800">{stats.pedidosActivos}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.pedidosPendientes} pendientes
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white/20 to-white/0 rounded-full">
            <FiShoppingCart className="text-orange-500 text-xl" />
          </div>
        </div>
      </motion.div>
      
      {/* Tarjeta 4: Alertas Stock */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.03, y: -5 }}
        className="relative bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500 overflow-hidden group"
      >
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Alertas Stock</p>
            <p className="text-3xl font-bold text-gray-800">{stats.alertasStock}</p>
            <p className="text-xs text-gray-500 mt-2">
              Items críticos/agotados
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-white/20 to-white/0 rounded-full">
            <FiPackage className="text-red-500 text-xl" />
          </div>
        </div>
      </motion.div>
    </motion.div>

      {/* Acciones rápidas */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Acciones Rápidas</h2>
            <p className="text-gray-600">Accede rápido a las funciones principales</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl">
            <FiZap className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleInfo.acciones.map((accion, index) => (
            <motion.a
              key={index}
              href={accion.url}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{accion.icono}</span>
                  <FiChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{accion.nombre}</h3>
                <p className="text-gray-600 text-sm">{accion.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Información adicional */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de rendimiento */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FiTrendingUp className="mr-3 text-green-500" />
            Rendimiento Hoy
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Ventas Totales</span>
                <span className="font-bold text-green-600">S/ {stats.ventasHoy.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.ventasHoy / 1000) * 100)}%` }}
                  transition={{ duration: 1 }}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Items Vendidos</span>
                <span className="font-bold text-blue-600">{stats.itemsVendidos}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.itemsVendidos / 50) * 100)}%` }}
                  transition={{ duration: 1 }}
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de estado del sistema */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FiActivity className="mr-3 text-blue-500" />
            Estado del Sistema
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-green-800">Frontend React</p>
                  <p className="text-sm text-green-600">v18.2.0</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-bold">
                ACTIVO
              </span>
            </div>
            
            <div className={`flex justify-between items-center p-4 rounded-xl ${
              stats.conexion ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${stats.conexion ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className={`font-medium ${stats.conexion ? 'text-blue-800' : 'text-red-800'}`}>
                    Backend Spring Boot
                  </p>
                  <p className={`text-sm ${stats.conexion ? 'text-blue-600' : 'text-red-600'}`}>
                    localhost:8080
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                stats.conexion ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'
              }`}>
                {stats.conexion ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mensaje de motivación */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white text-center"
      >
        <div className="max-w-2xl mx-auto">
          <FiAward className="text-5xl mx-auto mb-4 text-yellow-300" />
          <h3 className="text-2xl font-bold mb-3">
            {new Date().getHours() < 12 ? '¡Buenos días! ☀️' : 
             new Date().getHours() < 18 ? '¡Buenas tardes! 🌤️' : '¡Buenas noches! 🌙'}
          </h3>
          <p className="text-lg opacity-90">
            {user?.rol === 'mozo' && 'Hoy es un gran día para brindar un excelente servicio.'}
            {user?.rol === 'cocina' && 'Cada plato es una oportunidad para sorprender.'}
            {user?.rol === 'barra' && 'Las mejores bebidas salen de tus manos.'}
            {user?.rol === 'admin' && 'Tu gestión hace posible la excelencia.'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;