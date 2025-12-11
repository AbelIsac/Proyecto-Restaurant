// components/bar/BarPedidoCard.js - CORREGIDO
import React, { useState } from 'react';
import { 
  FiClock, 
  FiDroplet, 
  FiCheckCircle, 
  FiAlertCircle,
  FiMessageSquare,
  FiUser,
  FiFlag,
  FiX, 
  FiCoffee 
} from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BarPedidoCard = ({ pedido, onUpdateEstado, onCancelSuccess }) => { 
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  
  // Usa estadoBebida en lugar de estadoComida
  const estado = pedido.estadoBebida || 'pendiente';
  
  // Verificar si se puede cancelar
  const puedeCancelar = estado === 'pendiente';
  
  const formatearHora = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return format(fecha, 'HH:mm', { locale: es });
    } catch {
      return '--:--';
    }
  };

  const calcularTiempo = (fechaString) => {
    try {
      const ahora = new Date();
      const creado = new Date(fechaString);
      const minutos = Math.floor((ahora - creado) / (1000 * 60));
      
      if (minutos < 1) return 'Recién';
      if (minutos < 60) return `${minutos} min`;
      
      const horas = Math.floor(minutos / 60);
      return `${horas}h ${minutos % 60}m`;
    } catch {
      return '--';
    }
  };

  const minutosEspera = (() => {
    try {
      const ahora = new Date();
      const creado = new Date(pedido.creadoEn);
      return Math.floor((ahora - creado) / (1000 * 60));
    } catch {
      return 0;
    }
  })();

  // Estado de comida para mostrar
  const estadoComida = pedido.estadoComida || 'pendiente';

  // Filtrar solo bebidas
  const bebidas = pedido.detalles?.filter(detalle => 
    detalle.tipo === 'bebida' || 
    detalle.categoria === 'bebida' ||
    detalle.itemNombre?.toLowerCase().match(/(jugo|gaseosa|café|agua|cerveza|vino|trago|bebida)/)
  ) || [];

  return (
    <div className={`bg-white rounded-xl border-2 ${
      estado === 'preparando' ? 'border-blue-500' :
      estado === 'listo' ? 'border-green-500' :
      'border-gray-300'
    } p-5 hover:shadow-lg transition-all duration-200`}>
      
      {/* Indicador de estado de comida */}
      {estadoComida !== 'pendiente' && (
        <div className="mb-2">
          <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            <FiCoffee className="mr-1" size={12} />
            <span>
              Comida: {estadoComida === 'preparando' ? 'En cocina' : 
                      estadoComida === 'listo' ? 'Lista en cocina' : 'Pendiente'}
            </span>
          </div>
        </div>
      )}
      
      {/* Header del pedido */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              estado === 'preparando' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            } flex items-center space-x-1`}>
              {estado === 'pendiente' && <FiClock />}
              {estado === 'preparando' && <FiDroplet />}
              {estado === 'listo' && <FiCheckCircle />}
              <span>{estado.toUpperCase()}</span>
            </div>
            
            <span className="text-2xl font-bold text-gray-800">#{pedido.id}</span>
            
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              minutosEspera < 10 ? 'bg-green-100 text-green-800' :
              minutosEspera < 20 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              ⏱️ {calcularTiempo(pedido.creadoEn)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-gray-600">
              <FiUser size={14} />
              <span className="text-sm">Mesa {pedido.mesaId}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-600">
              <FiClock size={14} />
              <span className="text-sm">{formatearHora(pedido.creadoEn)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-gray-800">
            {bebidas.reduce((sum, d) => sum + d.cantidad, 0) || 0} bebidas
          </p>
          <p className="text-sm text-gray-600">Espera: {minutosEspera} min</p>
        </div>
      </div>

      {/* Items (solo bebidas) */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {bebidas.slice(0, 4).map((detalle, index) => (
            <div 
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center space-x-1"
            >
              <span className="font-bold">{detalle.cantidad}x</span>
              <span>{detalle.itemNombre}</span>
            </div>
          ))}
          
          {bebidas.length > 4 && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              +{bebidas.length - 4} más
            </div>
          )}
          
          {bebidas.length === 0 && (
            <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
              Sin bebidas en este pedido
            </div>
          )}
        </div>
      </div>

      {/* Botón para ver detalles */}
      <button
        onClick={() => setMostrarDetalles(!mostrarDetalles)}
        className="flex items-center justify-center w-full py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition mb-4"
      >
        <span className="text-sm">
          {mostrarDetalles ? 'Ocultar detalles' : 'Ver detalles de bebidas'}
        </span>
      </button>

      {/* Detalles expandidos */}
      {mostrarDetalles && bebidas.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Bebidas del pedido:</h4>
          <div className="space-y-3">
            {bebidas.map((detalle, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{detalle.itemNombre}</h5>
                    <p className="text-sm text-gray-600">
                      Cantidad: {detalle.cantidad} • S/ {detalle.precioUnitario?.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-bold">
                    S/ {(detalle.precioUnitario * detalle.cantidad).toFixed(2)}
                  </span>
                </div>
                
                {detalle.observaciones && (
                  <div className="mt-2">
                    <div className="flex items-start space-x-1">
                      <FiMessageSquare className="text-blue-500 mt-0.5 flex-shrink-0" size={12} />
                      <p className="text-xs text-blue-700 italic">
                        "{detalle.observaciones}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción PARA BEBIDAS */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        {/* Columna izquierda */}
        <div className="flex space-x-2">

          {/* Botón para marcar como urgente */}
          <button
            onClick={() => {/* TODO: Marcar como urgente */}}
            className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition"
          >
            <FiAlertCircle />
            <span className="text-sm">Urgente</span>
          </button>
        </div>

        {/* Botones de estado para BEBIDAS */}
        <div className="flex space-x-2">
          {estado === 'pendiente' && (
            <button
              onClick={() => onUpdateEstado(pedido.id, 'preparando')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              Iniciar Preparación
            </button>
          )}
          
          {estado === 'preparando' && (
            <button
              onClick={() => onUpdateEstado(pedido.id, 'listo')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
            >
              Marcar como Listo
            </button>
          )}
          
          {estado === 'listo' && (
            <div className="flex items-center space-x-2 text-green-600 font-medium">
              <FiCheckCircle />
              <span>Bebida lista</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarPedidoCard; 