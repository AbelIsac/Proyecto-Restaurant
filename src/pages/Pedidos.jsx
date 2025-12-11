import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { pedidoService } from '../services/api';
import PedidoCard from '../components/common/PedidoCard';
import CancelarPedidoModal from '../components/modals/CancelarPedidoModal';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendientes: 0,
    preparando: 0,
    listos: 0,
    total: 0
  });
  
 
  const cargarPedidos = useCallback(async () => {
    try {
      console.log('📦 Cargando pedidos...');
      
      let response;
      try {
        response = await pedidoService.getActivosParaMozo();
      } catch (error) {
        console.log('⚠️ Endpoint específico falló, usando fallback');
        response = await pedidoService.getActivos();
      }
      
      const pedidosData = response.data;
      console.log('✅ Pedidos recibidos:', pedidosData.length);
      console.log('🔍 Primer pedido:', pedidosData[0]);
      
      setPedidos(pedidosData);
      
      // Calcular estadísticas
      const pendientes = pedidosData.filter(p => {
        
        return (
          p.estadoGeneral === 'pendiente' ||
          p.estadoGeneral === 'PENDIENTE' ||
          p.estadoComida === 'pendiente' ||
          p.estadoBebida === 'pendiente' ||
          p.estado === 'pendiente' ||
          !p.estadoGeneral 
        );
      }).length;
      
      const preparando = pedidosData.filter(p => {
        return (
          p.estadoGeneral === 'preparando' ||
          p.estadoGeneral === 'PREPARANDO' ||
          p.estadoComida === 'preparando' ||
          p.estadoBebida === 'preparando' ||
          p.estado === 'preparando'
        );
      }).length;
      
      const listos = pedidosData.filter(p => {
        return (
          p.estadoGeneral === 'listo' ||
          p.estadoGeneral === 'LISTO' ||
          p.estado === 'listo' ||
          (p.estadoComida === 'listo' && p.estadoBebida === 'listo') ||
          p.estadoGeneral === 'entregado'
        );
      }).length;
      
      setStats({
        pendientes,
        preparando,
        listos,
        total: pedidosData.length
      });
      
      console.log('📊 Estadísticas calculadas:', { pendientes, preparando, listos, total: pedidosData.length });
      
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      toast.error('Error cargando pedidos');
      
      // Datos de prueba
      const datosPrueba = [
        {
          id: 1,
          mesaId: 2,
          estadoGeneral: 'pendiente',
          estadoComida: 'pendiente',
          estadoBebida: 'pendiente',
          total: 25.50,
          creadoEn: new Date().toISOString()
        },
        {
          id: 2,
          mesaId: 3,
          estadoGeneral: 'preparando',
          estadoComida: 'preparando',
          estadoBebida: 'listo',
          total: 18.00,
          creadoEn: new Date().toISOString()
        }
      ];
      
      setPedidos(datosPrueba);
      setStats({
        pendientes: 1,
        preparando: 1,
        listos: 0,
        total: 2
      });
      
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);
  
  // Debug: Ver qué datos llegan
  useEffect(() => {
    console.log('📊 Pedidos actualizados:', pedidos);
    console.log('🎯 Estadísticas:', stats);
  }, [pedidos, stats]);
  
  const handleActualizarEstado = async (pedidoId, accion) => {
    try {
      if (accion === 'entregado') {
        await pedidoService.marcarComoEntregado(pedidoId);
        toast.success('Pedido marcado como entregado');
      }
      await cargarPedidos();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error(error.response?.data?.message || 'Error actualizando estado');
    }
  };
  
  const handleCancelSuccess = async (pedidoId) => {
    try {
      await cargarPedidos();
      toast.success(`Pedido #${pedidoId} cancelado`);
    } catch (error) {
      toast.error('Error al actualizar lista de pedidos');
    }
  };
  
  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, [cargarPedidos]);
  
  // PANTALLA DE LOADING 
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Cargando pedidos...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-1">Total: {stats.total} pedidos activos</p>
        </div>
        <button
          onClick={cargarPedidos}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
        >
          🔄 Actualizar
        </button>
      </div>
      
      {/* Estadísticas MEJORADAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pendientes</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pendientes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-3">Esperando iniciar preparación</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">En Preparación</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{stats.preparando}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-3">En cocina o barra</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Listos para Entregar</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.listos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3">Listos para servir al cliente</p>
        </div>
      </div>
      
      {/* Debug info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <details>
          <summary className="font-medium text-blue-800 cursor-pointer">
            🔍 Información de depuración (click para ver)
          </summary>
          <div className="mt-3 text-sm">
            <p><strong>Total pedidos:</strong> {pedidos.length}</p>
            <p><strong>Primer pedido:</strong> {JSON.stringify(pedidos[0] || {}, null, 2)}</p>
            <p><strong>Estadísticas calculadas:</strong> {JSON.stringify(stats)}</p>
          </div>
        </details>
      </div>
      
      {/* Lista de pedidos */}
      <div className="space-y-4">
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No hay pedidos activos
            </h3>
            <p className="text-gray-600">
              Los pedidos aparecerán aquí cuando sean creados
            </p>
          </div>
        ) : (
          pedidos.map(pedido => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onUpdateEstado={(pedidoId, accion) => {
                if (accion === 'cancelar') {
                  setPedidoACancelar(pedido);
                } else {
                  handleActualizarEstado(pedidoId, accion);
                }
              }}
              mostrarAccionesMozo={true}
            />
          ))
        )}
      </div>
      
      {/* Modal de cancelación */}
      {pedidoACancelar && (
        <CancelarPedidoModal
          isOpen={!!pedidoACancelar}
          onClose={() => setPedidoACancelar(null)}
          pedido={pedidoACancelar}
          area="mozo"
          onCancelSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
};

export default Pedidos;