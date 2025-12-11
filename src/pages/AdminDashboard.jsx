import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiDollarSign, 
  FiActivity, 
  FiCoffee,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiAlertTriangle,
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { adminService, itemService, pedidoService, mesaService, stockService } from '../services/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ventasPorHora, setVentasPorHora] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [mesasEstado, setMesasEstado] = useState({ libres: 0, ocupadas: 0, limpieza: 0 });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const statsResponse = await adminService.getEstadisticas();
      setEstadisticas(statsResponse.data);
      
      // CARGAR STOCK REAL usando stockService
      try {
        const stockResponse = await stockService.getReport();
        
        // Filtrar items con problemas de stock
        const alertasStockFiltradas = stockResponse.data.filter(item => 
          item.estadoStock === 'bajo' || 
          item.estadoStock === 'critico' || 
          item.estadoStock === 'agotado'
        );
        
        setAlertasStock(alertasStockFiltradas.map(item => ({
          id: item.itemId,
          nombre: item.itemNombre,
          stock: item.stockActual,
          stockMinimo: item.stockMinimo,
          severidad: item.estadoStock,
          categoria: item.categoria || 'General',
          subcategoria: item.subcategoria || '',
          necesitaReabastecimiento: item.stockActual < item.stockMinimo,
          reabastecerCantidad: Math.max(item.stockMinimo * 3 - item.stockActual, 20)
        })));
        
      } catch (stockError) {
        console.warn('Error cargando stock:', stockError);
        // Si falla, intentar con endpoint alternativo
        try {
          const itemsResponse = await itemService.getAll();
          const itemsAgotados = itemsResponse.data.filter(item => 
            item.disponible === 0
          );
          
          setAlertasStock(itemsAgotados.map(item => ({
            id: item.id,
            nombre: item.nombre,
            stock: 0,
            stockMinimo: 10,
            severidad: 'agotado',
            categoria: item.subcategoria?.categoria?.nombre || 'General',
            subcategoria: item.subcategoria?.nombre || '',
            necesitaReabastecimiento: true,
            reabastecerCantidad: 30
          })));
        } catch (fallbackError) {
          console.warn('Fallback también falló:', fallbackError);
          setAlertasStock([]);
        }
      }
      
      // cargar pedidos recientes
      const pedidosResponse = await pedidoService.getActivos();
      const ultimosPedidos = pedidosResponse.data.slice(0, 5);
      setPedidosRecientes(ultimosPedidos);
      
      // cargar estado de mesas
      const mesasResponse = await mesaService.getAll();
      const estadoMesas = {
        libres: mesasResponse.data.filter(m => m.estado === 'libre').length,
        ocupadas: mesasResponse.data.filter(m => m.estado === 'ocupada').length,
        limpieza: mesasResponse.data.filter(m => m.estado === 'limpieza').length,
      };
      setMesasEstado(estadoMesas);
      
      // calcular ventas por hora
      const horas = Array.from({ length: 12 }, (_, i) => i + 8);
      const ventasSimuladas = horas.map(hora => {
        const ventaBase = statsResponse.data?.ventasHoy ? statsResponse.data.ventasHoy / 1200 : 150;
        const factorHora = hora >= 12 && hora <= 14 ? 2.5 : hora >= 19 && hora <= 21 ? 3 : 1;
        return {
          hora: `${hora}:00`,
          monto: Math.floor(ventaBase * factorHora * (0.8 + Math.random() * 0.4))
        };
      });
      setVentasPorHora(ventasSimuladas);
      
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // Función para reabastecer un solo item
  const reabastecerItem = async (itemId, cantidad) => {
    try {
      toast.loading('Reabasteciendo...', { id: 'reabastecer' });
      
      await stockService.increase(itemId, cantidad, 'reabastecimiento desde dashboard');
      
      toast.success('¡Stock actualizado!', { id: 'reabastecer' });
      
      // actualizar la lista de alertas localmente
      setAlertasStock(prev => 
        prev.map(alerta => 
          alerta.id === itemId 
            ? { 
                ...alerta, 
                stock: alerta.stock + cantidad,
                severidad: (alerta.stock + cantidad) >= alerta.stockMinimo ? 'normal' : 
                          (alerta.stock + cantidad) <= (alerta.stockMinimo / 2) ? 'critico' :
                          (alerta.stock + cantidad) <= alerta.stockMinimo ? 'bajo' : 'normal',
                necesitaReabastecimiento: (alerta.stock + cantidad) < alerta.stockMinimo
              }
            : alerta
        ).filter(alerta => alerta.severidad !== 'normal')
      );
      
    } catch (error) {
      toast.error('Error al reabastecer', { id: 'reabastecer' });
      console.error('Error reabasteciendo:', error);
    }
  };

  // función para reabastecer TODOS los items con problemas
  const reabastecerTodo = async () => {
    try {
      if (alertasStock.length === 0) {
        toast.success('No hay items para reabastecer');
        return;
      }
      
      toast.loading(`Reabasteciendo ${alertasStock.length} items...`, { 
        id: 'reabastecer-todo',
        duration: 3000 
      });
      
      // Crear array de items para reabastecer
      const itemsParaReabastecer = alertasStock.map(alerta => ({
        itemId: alerta.id,
        cantidad: alerta.reabastecerCantidad || 30,
        tipo: 'aumentar',
        motivo: 'reabastecimiento masivo'
      }));
      
      await stockService.restockMultiple(itemsParaReabastecer);
      
      toast.success(`¡${alertasStock.length} items reabastecidos!`, { 
        id: 'reabastecer-todo' 
      });
      
      // Limpiar todas las alertas
      setAlertasStock([]);
      
      // Recargar datos después de 2 segundos
      setTimeout(() => {
        cargarDatos();
      }, 2000);
      
    } catch (error) {
      toast.error('Error al reabastecer todos los items', { id: 'reabastecer-todo' });
      console.error('Error reabasteciendo todo:', error);
    }
  };

  // Componente interno para mostrar cada alerta de stock
  const StockAlertItem = ({ alerta }) => {
    const inputRef = useRef(null);
    
    const getIcon = () => {
      switch (alerta.severidad) {
        case 'critico': return <FiAlertTriangle className="text-red-600" />;
        case 'bajo': return <FiAlertTriangle className="text-yellow-600" />;
        case 'agotado': return <FiPackage className="text-gray-600" />;
        default: return <FiCheckCircle className="text-green-600" />;
      }
    };
    
    const getColor = () => {
      switch (alerta.severidad) {
        case 'critico': return 'text-red-700';
        case 'bajo': return 'text-yellow-700';
        case 'agotado': return 'text-gray-700';
        default: return 'text-green-700';
      }
    };
    
    const getDescripcion = () => {
      switch (alerta.severidad) {
        case 'critico': return 'Stock CRÍTICO - ¡Reabastecer URGENTE!';
        case 'bajo': return 'Stock BAJO - Reabastecer pronto';
        case 'agotado': return 'AGOTADO - Sin stock disponible';
        default: return 'Stock normal';
      }
    };
    
    return (
      <div className="transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-3 ${
              alerta.severidad === 'critico' ? 'bg-red-200' :
              alerta.severidad === 'bajo' ? 'bg-yellow-200' :
              'bg-gray-200'
            }`}>
              {getIcon()}
            </div>
            <div>
              <p className="font-medium">{alerta.nombre}</p>
              <p className="text-sm text-gray-600">
                {alerta.categoria} {alerta.subcategoria && `• ${alerta.subcategoria}`}
              </p>
              <p className={`text-xs font-medium mt-1 ${getColor()}`}>
                {getDescripcion()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-2xl font-bold ${getColor()}`}>
              {alerta.stock} u.
            </p>
            <p className="text-xs text-gray-500">
              Mínimo: {alerta.stockMinimo} u.
            </p>
          </div>
        </div>
        
        {/* Formulario para reabastecer */}
        <div className="flex items-center justify-end mt-3 space-x-2">
          <input
            type="number"
            min="1"
            max="1000"
            defaultValue={alerta.reabastecerCantidad || 20}
            ref={inputRef}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Cantidad"
          />
          <button
            onClick={() => reabastecerItem(alerta.id, parseInt(inputRef.current?.value || 20))}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Aplicar
          </button>
          <button
            onClick={() => reabastecerItem(alerta.id, alerta.reabastecerCantidad || 20)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Sugerido ({alerta.reabastecerCantidad || 20})
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  // calcular tasa de ocupación real
  const calcularTasaOcupacion = () => {
    const totalMesas = mesasEstado.libres + mesasEstado.ocupadas + mesasEstado.limpieza;
    return totalMesas > 0 ? Math.round((mesasEstado.ocupadas / totalMesas) * 100) : 0;
  };

  // calcular ticket promedio
  const calcularTicketPromedio = () => {
    if (!estadisticas?.ventasHoy || !estadisticas?.totalPedidosHoy) return 0;
    return estadisticas.totalPedidosHoy > 0 ? estadisticas.ventasHoy / estadisticas.totalPedidosHoy : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Cargando datos del dashboard...</p>
        <p className="text-sm text-gray-500">Actualizando estadísticas en tiempo real</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control Administrativo</h1>
            <p className="text-blue-100 mt-2">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-blue-200 mt-1">Monitoreo en tiempo real del restaurante</p>
          </div>
          
          <button
            onClick={cargarDatos}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300"
          >
            <FiRefreshCw className="animate-spin-on-hover" />
            <span className="font-medium">Actualizar Datos</span>
          </button>
        </div>
      </div>

      {/* Grid principal de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Pedidos Hoy</p>
              <p className="text-3xl font-bold mt-2">{estadisticas?.totalPedidosHoy || 0}</p>
              <div className="flex items-center mt-2 text-blue-200">
                <FiActivity className="mr-2" />
                <span className="text-sm">{estadisticas?.pedidosActivos || 0} activos</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <FiShoppingCart size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ventas Hoy</p>
              <p className="text-3xl font-bold mt-2">S/ {(estadisticas?.ventasHoy || 0).toFixed(2)}</p>
              <div className="flex items-center mt-2 text-green-200">
                <FiTrendingUp className="mr-2" />
                <span className="text-sm">Total recaudado</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <FiDollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Ocupación</p>
              <p className="text-3xl font-bold mt-2">{calcularTasaOcupacion()}%</p>
              <div className="flex items-center mt-2 text-orange-200">
                <FiCoffee className="mr-2" />
                <span className="text-sm">{mesasEstado.ocupadas} mesas ocupadas</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <FiActivity size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Ticket Promedio</p>
              <p className="text-3xl font-bold mt-2">S/ {calcularTicketPromedio().toFixed(2)}</p>
              <div className="flex items-center mt-2 text-purple-200">
                <FiUsers className="mr-2" />
                <span className="text-sm">Por pedido</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <FiBarChart2 size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila: Gráficos y datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de ventas por hora */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Ventas por Hora (Hoy)</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Última actualización:</span>
              <span className="text-sm font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div className="h-64">
            <div className="flex items-end h-full space-x-4">
              {ventasPorHora.map((venta, index) => {
                const maxVenta = Math.max(...ventasPorHora.map(v => v.monto));
                const altura = maxVenta > 0 ? (venta.monto / maxVenta) * 100 : 0;
                const esHoraPico = venta.monto > (maxVenta * 0.7);
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 hover:shadow-lg ${
                        esHoraPico 
                          ? 'bg-gradient-to-t from-orange-500 to-yellow-400' 
                          : 'bg-gradient-to-t from-blue-500 to-blue-400'
                      }`}
                      style={{ height: `${altura}%` }}
                      title={`S/ ${venta.monto} a las ${venta.hora}`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-xs text-white font-bold pt-2">
                        S/ {venta.monto}
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-medium text-gray-600">{venta.hora}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center mt-6 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Horas normales</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Horas pico</span>
            </div>
          </div>
        </div>

        {/* Estado de mesas */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Estado de Mesas</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-green-800">Mesas Libres</p>
                  <p className="text-sm text-green-600">Listas para ocupar</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-700">{mesasEstado.libres}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-red-800">Mesas Ocupadas</p>
                  <p className="text-sm text-red-600">Con clientes atendiendo</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-700">{mesasEstado.ocupadas}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-yellow-800">En Limpieza</p>
                  <p className="text-sm text-yellow-600">Preparando para clientes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-700">{mesasEstado.limpieza}</span>
            </div>
          </div>
          
          {/* Progreso de ocupación */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Ocupación Total</span>
              <span className="text-sm font-bold text-gray-900">{calcularTasaOcupacion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${calcularTasaOcupacion()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila: Items y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items más vendidos */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Productos Más Vendidos</h3>
            <span className="text-sm text-gray-500">Hoy</span>
          </div>
          
          <div className="space-y-4">
            {estadisticas?.itemsMasVendidos?.slice(0, 5).map((item, index) => (
              <div key={item.itemId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.nombre}</p>
                    <p className="text-sm text-gray-500">{item.cantidadVendida} unidades</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 font-bold mr-2">+{item.cantidadVendida}</span>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiTrendingUp className="text-green-600" size={16} />
                  </div>
                </div>
              </div>
            ))}
            
            {(!estadisticas?.itemsMasVendidos || estadisticas.itemsMasVendidos.length === 0) && (
              <div className="text-center py-8">
                <div className="text-gray-300 text-4xl mb-3">📊</div>
                <p className="text-gray-500">No hay datos de ventas aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de stock - MEJORADO */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Alertas de Stock</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                alertasStock.filter(a => a.severidad === 'critico').length > 0 
                  ? 'bg-red-100 text-red-800' 
                  : alertasStock.filter(a => a.severidad === 'bajo').length > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {alertasStock.length} {alertasStock.length === 1 ? 'alerta' : 'alertas'}
              </span>
              <button 
                onClick={reabastecerTodo}
                disabled={alertasStock.length === 0}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Reabastecer Todo
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {alertasStock.length > 0 ? (
              <>
                {/* Items críticos primero */}
                {alertasStock
                  .filter(alerta => alerta.severidad === 'critico')
                  .map(alerta => (
                    <div key={alerta.id} className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                      <StockAlertItem alerta={alerta} />
                    </div>
                  ))
                }
                
                {/* Items bajos después */}
                {alertasStock
                  .filter(alerta => alerta.severidad === 'bajo')
                  .map(alerta => (
                    <div key={alerta.id} className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                      <StockAlertItem alerta={alerta} />
                    </div>
                  ))
                }
                
                {/* Items agotados */}
                {alertasStock
                  .filter(alerta => alerta.severidad === 'agotado')
                  .map(alerta => (
                    <div key={alerta.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <StockAlertItem alerta={alerta} />
                    </div>
                  ))
                }
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-300 text-4xl mb-3">✅</div>
                <p className="text-green-600 font-medium">Stock en niveles normales</p>
                <p className="text-sm text-gray-500 mt-1">Todos los productos con stock suficiente</p>
              </div>
            )}
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Pedidos Recientes</h3>
            <span className="text-sm text-gray-500">Últimos 5</span>
          </div>
          
          <div className="space-y-4">
            {pedidosRecientes.map(pedido => (
              <div 
                key={pedido.id} 
                className="p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow transition-all cursor-pointer group"
                onClick={() => window.location.href = `/admin/pedido/${pedido.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                      Pedido #{pedido.id}
                    </p>
                    <p className="text-sm text-gray-600">Mesa {pedido.mesaId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pedido.estadoGeneral === 'entregado' ? 'bg-green-100 text-green-800' :
                    pedido.estadoGeneral === 'preparando' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {pedido.estadoGeneral}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <FiClock className="inline mr-1" size={12} />
                    {new Date(pedido.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-green-600">S/ {pedido.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click para ver detalles →
                </div>
              </div>
            ))}
            
            {pedidosRecientes.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-300 text-4xl mb-3">🛒</div>
                <p className="text-gray-500">No hay pedidos activos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pie de página con resumen */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-300 text-sm">Eficiencia Cocina</p>
            <p className="text-3xl font-bold mt-2">92%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300 text-sm">Eficiencia Barra</p>
            <p className="text-3xl font-bold mt-2">88%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300 text-sm">Satisfacción Cliente</p>
            <p className="text-3xl font-bold mt-2">94%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// animaciones
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-on-hover:hover {
    animation: spin 1s linear;
  }
  .transition-all {
    transition-property: all;
  }
  .hover\\:shadow-lg:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;


const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AdminDashboard;