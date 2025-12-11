import React, { useState, useEffect } from 'react';
import BoucherTicket from '../components/admin/BoucherTicket';
import { useParams, useNavigate } from 'react-router-dom';
import { pedidoService, mesaService } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiPrinter, 
  FiClock, 
  FiUser, 
  FiCoffee,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiShoppingBag,
  FiAlertCircle
} from 'react-icons/fi';

const DetallePedidoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reimprimiendo, setReimprimiendo] = useState(false);
  const [mostrarBoucher, setMostrarBoucher] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar pedido
      const pedidoResponse = await pedidoService.getById(id);
      setPedido(pedidoResponse.data);
      
      // Cargar información de la mesa
      if (pedidoResponse.data.mesaId) {
        try {
          const mesaResponse = await mesaService.getById(pedidoResponse.data.mesaId);
          setMesa(mesaResponse.data);
        } catch (mesaError) {
          console.warn('No se pudo cargar información de la mesa:', mesaError);
        }
      }
      
    } catch (error) {
      console.error('Error cargando pedido:', error);
      toast.error('No se pudo cargar el detalle del pedido');
      navigate('/admin-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReimprimir = async () => {
    try {
      setReimprimiendo(true);
      // Aquí iría la lógica de integración con la impresora
      // Por ahora simulamos con un toast
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Boleta enviada a impresora');
    } catch (error) {
      toast.error('Error al imprimir');
    } finally {
      setReimprimiendo(false);
    }
  };


  const handleCancelarPedido = async () => {
    if (!window.confirm('¿ESTÁ SEGURO DE CANCELAR ESTE PEDIDO?\n\nEsta acción NO se puede deshacer.')) {
      return;
    }
    
    try {
      // Pedir motivo de cancelación
      const motivo = prompt('Ingrese el motivo de cancelación (requerido):');
      if (!motivo || motivo.trim() === '') {
        toast.error('Debe ingresar un motivo para cancelar');
        return;
      }
      
      toast.loading('Cancelando pedido...', { id: 'cancelar-pedido' });
      
      // Llamar al servicio REAL de cancelación
      await pedidoService.cancelar(id, { 
        motivo: motivo.trim(),
        usuarioId: localStorage.getItem('user_id') || 1
      });
      
      toast.success('Pedido cancelado correctamente', { id: 'cancelar-pedido' });
      
      // Mostrar mensaje y redirigir
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
      
    } catch (error) {
      toast.dismiss('cancelar-pedido');
      
      // Verificar el tipo de error
      if (error.response?.status === 400) {
        toast.error('No se puede cancelar un pedido ya entregado');
      } else if (error.response?.status === 404) {
        toast.error('Pedido no encontrado');
      } else {
        toast.error('Error al cancelar el pedido');
        console.error('Error completo:', error);
      }
    }
};

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'preparando': return 'bg-orange-100 text-orange-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'pagado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'entregado': return <FiCheckCircle className="text-green-600" />;
      case 'preparando': return <FiClock className="text-orange-600" />;
      case 'cancelado': return <FiXCircle className="text-red-600" />;
      case 'pagado': return <FiDollarSign className="text-blue-600" />;
      default: return <FiPackage className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando detalle del pedido...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-300 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-600 mb-6">El pedido que buscas no existe o fue eliminado</p>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calcular subtotal, IGV y total
  const subtotal = pedido.detalles?.reduce((sum, detalle) => {
    const precioItem = detalle.cantidad * detalle.precioUnitario;
    const precioExtras = detalle.extras?.reduce((extraSum, extra) => 
      extraSum + (extra.precio || 0), 0) || 0;
    return sum + precioItem + precioExtras;
  }, 0) || 0;

  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <FiArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Detalle del Pedido #{pedido.id}</h1>
                <div className="flex items-center space-x-4 mt-2 text-blue-100">
                  <span className="flex items-center">
                    <FiClock className="mr-2" />
                    {new Date(pedido.creadoEn).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="flex items-center">
                    <FiUser className="mr-2" />
                    ID Usuario: {pedido.usuarioId}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-full flex items-center ${getEstadoColor(pedido.estadoGeneral)}`}>
                {getEstadoIcono(pedido.estadoGeneral)}
                <span className="ml-2 font-medium capitalize">{pedido.estadoGeneral}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Detalles del pedido */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información de la mesa */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiCoffee className="mr-3 text-blue-600" />
                Información de la Mesa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Mesa #</p>
                  <p className="text-3xl font-bold text-blue-800">{pedido.mesaId}</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Estado Mesa</p>
                  <p className="text-xl font-bold text-green-800 capitalize">
                    {mesa?.estado || 'No disponible'}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium">Capacidad</p>
                  <p className="text-xl font-bold text-purple-800">
                    {mesa?.capacidad || 'N/A'} personas
                  </p>
                </div>
              </div>
            </div>

            {/* Items del pedido */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiShoppingBag className="mr-3 text-orange-600" />
                Items del Pedido ({pedido.detalles?.length || 0})
              </h2>
              
              <div className="space-y-4">
                {pedido.detalles?.map((detalle, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-4">
                            <span className="font-bold text-blue-700 text-xl">
                              {detalle.cantidad}x
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{detalle.itemNombre}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-gray-600">
                                S/ {detalle.precioUnitario?.toFixed(2)} c/u
                              </span>
                              <span className="text-green-600 font-bold">
                                S/ {(detalle.cantidad * detalle.precioUnitario).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Observaciones */}
                        {detalle.observaciones && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                              <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                              <p className="text-sm text-yellow-800">{detalle.observaciones}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Extras */}
                    {detalle.extras?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Extras:</h4>
                        <div className="space-y-2 pl-4">
                          {detalle.extras.map((extra, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">+ {extra.nombre}</span>
                              <span className="font-medium">S/ {extra.precio?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {(!pedido.detalles || pedido.detalles.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-6xl mb-4">🍽️</div>
                  <p className="text-gray-500">No hay items en este pedido</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Resumen y acciones */}
          <div className="space-y-8">
            {/* Resumen del pago */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiDollarSign className="mr-3 text-green-600" />
                Resumen del Pago
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">IGV (18%):</span>
                  <span className="font-medium">S/ {igv.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      S/ {total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    Incluye todos los items y extras
                  </p>
                </div>
              </div>

              {/* Método de pago (simulado) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Método de Pago</h3>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <FiDollarSign className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Efectivo</p>
                      <p className="text-sm text-gray-600">Pagado en caja</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Acciones</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setMostrarBoucher(true)}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition"
                >
                  <FiPrinter className="mr-3" />
                  Ver/Imprimir Boucher
                </button>
                
                
                {pedido.estadoGeneral !== 'cancelado' && (
                  <button
                    onClick={handleCancelarPedido}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition"
                  >
                    <FiXCircle className="mr-3" />
                    Cancelar Pedido
                  </button>
                )}
              </div>
              
              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Información Adicional</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Creado por:</span>
                    <span className="font-medium">Usuario #{pedido.usuarioId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo preparación:</span>
                    <span className="font-medium">~25 minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span className="font-medium">
                      {pedido.actualizadoEn ? 
                        new Date(pedido.actualizadoEn).toLocaleTimeString() : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-6 border-t border-gray-200 mt-8">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Sistema de Gestión de Restaurante v1.0</span>
          <span>Pedido ID: {pedido.id} • {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Modal del boucher */}
      {mostrarBoucher && (
        <BoucherTicket 
          pedido={pedido} 
          onClose={() => setMostrarBoucher(false)} 
        />
      )}
    </div>

    
  );
};

export default DetallePedidoPage;