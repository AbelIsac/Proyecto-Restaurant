import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiAlertTriangle, 
  FiMessageSquare, 
  FiUser,
  FiClock,
  FiCheckCircle,
  FiCoffee,
  FiDroplet,
  FiPackage,
  FiDollarSign
} from 'react-icons/fi';
import { pedidoService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CancelarPedidoModal = ({ 
  isOpen, 
  onClose, 
  pedido, 
  onCancelSuccess,
  area = 'cocina' // 'cocina' o 'bar'
}) => {
  const [razon, setRazon] = useState('');
  const [loading, setLoading] = useState(false);
  const [razonesPredefinidas, setRazonesPredefinidas] = useState([]);
  const [detallesPedido, setDetallesPedido] = useState(null);
  const [confirmacionExtra, setConfirmacionExtra] = useState(false);

  // Cargar razones predefinidas y detalles del pedido
  useEffect(() => {
    if (isOpen && pedido) {
      cargarRazonesPredefinidas();
      cargarDetallesPedido();
      setConfirmacionExtra(false);
      setRazon('');
    }
  }, [isOpen, pedido]);

  const cargarRazonesPredefinidas = () => {
    const razones = {
      cocina: [
        'Falta de ingredientes',
        'Equipo de cocina dañado',
        'Error en el pedido',
        'Cliente cambió la orden',
        'Tiempo de preparación excesivo',
        'Calidad insuficiente',
        'Alergia no detectada',
        'Especificaciones incorrectas'
      ],
      bar: [
        'Falta de licor/bebida',
        'Equipo de barra dañado',
        'Error en la preparación',
        'Cliente cambió la bebida',
        'Bebida no disponible',
        'Cristalería rota',
        'Especificaciones incorrectas',
        'Alergia a ingredientes'
      ],
      general: [
        'Cliente se retiró',
        'Mesa cancelada',
        'Error del sistema',
        'Doble pedido',
        'Pedido incorrecto',
        'Problema con la mesa',
        'Emergencia',
        'Otro'
      ]
    };

    const razonesCombinadas = [
      ...razones.general,
      ...(area === 'cocina' ? razones.cocina : razones.bar)
    ];
    
    setRazonesPredefinidas(razonesCombinadas);
  };

  const cargarDetallesPedido = async () => {
    try {
      // Si no vienen todos los detalles en el pedido, cargarlos
      if (pedido && !pedido.detallesCompletos) {
        const response = await pedidoService.getById(pedido.id);
        setDetallesPedido(response.data);
      } else {
        setDetallesPedido(pedido);
      }
    } catch (error) {
      console.error('Error cargando detalles del pedido:', error);
      setDetallesPedido(pedido);
    }
  };

  // Calcular tiempo de espera
  const calcularTiempoEspera = () => {
    if (!detallesPedido?.creadoEn) return 0;
    
    try {
      const creado = new Date(detallesPedido.creadoEn);
      const ahora = new Date();
      return Math.floor((ahora - creado) / (1000 * 60));
    } catch {
      return 0;
    }
  };

  // Obtener estado actual según el área
  const obtenerEstadoActual = () => {
    if (!detallesPedido) return 'pendiente';
    
    if (area === 'cocina') {
      return detallesPedido.estadoComida || 'pendiente';
    } else {
      return detallesPedido.estadoBebida || 'pendiente';
    }
  };

  // Verificar si se puede cancelar
  const puedeCancelar = () => {
    const estado = obtenerEstadoActual();
    return estado === 'pendiente';
  };

  // Formatear hora
  const formatearHora = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return format(fecha, 'HH:mm', { locale: es });
    } catch {
      return '--:--';
    }
  };

  // Obtener icono según estado
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'pendiente': return <FiClock className="text-yellow-500" />;
      case 'preparando': 
        return area === 'cocina' 
          ? <FiCoffee className="text-orange-500" />
          : <FiDroplet className="text-blue-500" />;
      case 'listo': return <FiCheckCircle className="text-green-500" />;
      default: return <FiClock />;
    }
  };

  // Obtener color según estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'preparando': 
        return area === 'cocina' 
          ? 'bg-orange-100 text-orange-800'
          : 'bg-blue-100 text-blue-800';
      case 'listo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcular total del pedido
  const calcularTotalPedido = () => {
    if (!detallesPedido?.detalles) return 0;
    
    return detallesPedido.detalles.reduce((total, detalle) => {
      return total + (detalle.precioUnitario || 0) * (detalle.cantidad || 1);
    }, 0);
  };

  // Separar comidas y bebidas
  const separarItems = () => {
    if (!detallesPedido?.detalles) {
      return { comidas: [], bebidas: [] };
    }

    const comidas = [];
    const bebidas = [];

    detallesPedido.detalles.forEach(detalle => {
      const nombre = detalle.itemNombre?.toLowerCase() || '';
      const esBebida = nombre.match(/(jugo|gaseosa|refresco|coca|inca|cola|café|té|infusión|agua|mineral|cerveza|pilsen|cristal|cusqueña|heineken|vino|tinto|blanco|espumante|champagne|trago|coctel|mojito|pisco|sour|cuba|whisky|ron|vodka|tequila|gin|licor|batido|smoothie|milkshake|malteada|chicha|emoliente|mate)/);
      
      if (esBebida) {
        bebidas.push(detalle);
      } else {
        comidas.push(detalle);
      }
    });

    return { comidas, bebidas };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!puedeCancelar()) {
      toast.error(`No se puede cancelar un pedido que ya está en ${obtenerEstadoActual()}`);
      return;
    }

    if (!razon.trim()) {
      toast.error('Por favor ingresa una razón para cancelar');
      return;
    }

    if (razon.trim().length < 5) {
      toast.error('La razón debe tener al menos 5 caracteres');
      return;
    }

    if (!confirmacionExtra) {
      toast.error('Debes confirmar que entiendes las consecuencias');
      return;
    }

    setLoading(true);
    try {
      const usuarioId = localStorage.getItem('user_id') || 1;
      
      toast.loading(`Cancelando pedido #${pedido.id}...`, { id: 'cancelando' });
      
      await pedidoService.cancelar(pedido.id, {
        usuarioId: parseInt(usuarioId),
        razon: razon.trim()
      });
      
      toast.dismiss('cancelando');
      toast.success(`✅ Pedido #${pedido.id} cancelado completamente`);
      
      if (onCancelSuccess) {
        onCancelSuccess(pedido.id);
      }
      
      setRazon('');
      setConfirmacionExtra(false);
      onClose();
      
    } catch (error) {
      toast.dismiss('cancelando');
      console.error('Error cancelando pedido:', error);
      
      if (error.response?.status === 400) {
        if (error.response?.data?.includes('preparación')) {
          toast.error('⚠️ No se puede cancelar: El pedido ya está en preparación');
        } else if (error.response?.data?.includes('cancelado')) {
          toast.error('⚠️ El pedido ya fue cancelado anteriormente');
        } else {
          toast.error(error.response.data?.message || 'Error en la solicitud');
        }
      } else if (error.response?.status === 404) {
        toast.error('❌ El pedido no fue encontrado');
      } else if (error.response?.status === 500) {
        toast.error('❌ Error interno del servidor');
      } else if (!error.response) {
        toast.error('❌ No se pudo conectar con el servidor');
      } else {
        toast.error('❌ Error al cancelar el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !pedido) return null;

  const estadoActual = obtenerEstadoActual();
  const tiempoEspera = calcularTiempoEspera();
  const totalPedido = calcularTotalPedido();
  const { comidas, bebidas } = separarItems();
  const esUrgente = tiempoEspera > 20;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Cancelar Pedido</h2>
              <p className="text-gray-600">
                Pedido #{pedido.id} • Mesa {pedido.mesaId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={loading}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Información del pedido */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Estado actual */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Estado actual</p>
              <div className="flex items-center space-x-2">
                {obtenerIconoEstado(estadoActual)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerColorEstado(estadoActual)}`}>
                  {estadoActual.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Tiempo de espera */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiempo de espera</p>
              <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                tiempoEspera < 10 ? 'bg-green-100 text-green-800' :
                tiempoEspera < 20 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <FiClock className="inline mr-1" />
                {tiempoEspera} minutos
              </div>
            </div>

            {/* Hora de creación */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Hora de creación</p>
              <p className="text-gray-700 font-medium">
                {formatearHora(pedido.creadoEn)}
              </p>
            </div>

            {/* Mesa */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Mesa</p>
              <p className="text-gray-700 font-bold">
                #{pedido.mesaId}
              </p>
            </div>
          </div>

          {/* Total del pedido */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiDollarSign className="text-blue-600" />
                <span className="font-medium text-blue-800">Total del pedido:</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                S/ {totalPedido.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Advertencia si no se puede cancelar */}
          {!puedeCancelar() && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <FiAlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">¡No se puede cancelar!</p>
                  <p className="text-sm text-red-700 mt-1">
                    Este pedido ya está en estado <strong>{estadoActual}</strong>.
                    Solo se pueden cancelar pedidos pendientes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detalles de lo que se cancelará */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <FiPackage className="mr-2" />
            Se cancelará TODO el pedido:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Comidas */}
            {comidas.length > 0 && (
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center text-gray-700 mb-2">
                  <FiCoffee className="mr-2 text-orange-500" />
                  <span className="font-medium">Comidas ({comidas.length})</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {comidas.slice(0, 5).map((detalle, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex justify-between">
                      <span>• {detalle.cantidad}x {detalle.itemNombre}</span>
                      <span className="text-gray-500">
                        S/ {(detalle.precioUnitario * detalle.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {comidas.length > 5 && (
                    <div className="text-sm text-gray-500 italic">
                      • y {comidas.length - 5} más...
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Bebidas */}
            {bebidas.length > 0 && (
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center text-gray-700 mb-2">
                  <FiDroplet className="mr-2 text-blue-500" />
                  <span className="font-medium">Bebidas ({bebidas.length})</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {bebidas.slice(0, 5).map((detalle, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex justify-between">
                      <span>• {detalle.cantidad}x {detalle.itemNombre}</span>
                      <span className="text-gray-500">
                        S/ {(detalle.precioUnitario * detalle.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {bebidas.length > 5 && (
                    <div className="text-sm text-gray-500 italic">
                      • y {bebidas.length - 5} más...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold">{comidas.length + bebidas.length}</span> items • 
              Importe total: <span className="font-bold text-red-600">S/ {totalPedido.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Advertencia IMPORTANTE */}
        <div className="p-6 border-b">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-red-800 mb-2">⚠️ ATENCIÓN: Cancelación COMPLETA</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Se cancelará <strong>TODO el pedido</strong> (comida + bebidas)</li>
                  <li>• Se eliminará de todas las áreas (cocina y bar)</li>
                  <li>• No se podrá reactivar ni recuperar</li>
                  <li>• Se notificará al área de administración</li>
                  <li>• Esta acción es <strong>IRREVERSIBLE</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmación extra */}
          <div className="mt-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={confirmacionExtra}
                onChange={(e) => setConfirmacionExtra(e.target.checked)}
                disabled={loading || !puedeCancelar()}
                className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-medium text-gray-800">
                  Confirmo que entiendo las consecuencias
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Estoy consciente de que esta acción cancelará completamente el pedido 
                  y no podrá ser revertida.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Formulario de cancelación */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2 mb-1">
                <FiMessageSquare size={16} />
                <span>Razón de cancelación *</span>
              </div>
              <textarea
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none"
                placeholder={`Describe el motivo de la cancelación completa...`}
                required
                disabled={loading || !puedeCancelar()}
                maxLength={500}
              />
            </label>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Mínimo 5 caracteres, máximo 500
              </p>
              <span className={`text-xs ${razon.length > 500 ? 'text-red-600' : 'text-gray-500'}`}>
                {razon.length}/500
              </span>
            </div>
          </div>

          {/* Razones predefinidas */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Razones comunes:</p>
            <div className="flex flex-wrap gap-2">
              {razonesPredefinidas.map((razonPredefinida) => (
                <button
                  key={razonPredefinida}
                  type="button"
                  onClick={() => setRazon(razonPredefinida)}
                  disabled={loading || !puedeCancelar()}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {razonPredefinida}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading || !puedeCancelar() || !razon.trim() || razon.trim().length < 5 || !confirmacionExtra}
              className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center space-x-2 ${
                loading || !puedeCancelar() || !razon.trim() || razon.trim().length < 5 || !confirmacionExtra
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cancelando...</span>
                </>
              ) : (
                <>
                  <FiAlertTriangle />
                  <span>Cancelar Pedido Completo</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer informativo */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">
              Cancelación registrada por: {localStorage.getItem('user_name') || 'Usuario'}
            </p>
            <p className="text-xs text-gray-400">
              Fecha: {new Date().toLocaleDateString()} • Hora: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelarPedidoModal;