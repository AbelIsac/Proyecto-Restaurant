import React from 'react';
import { FiCheckCircle, FiX, FiClock, FiCoffee, FiDroplet } from 'react-icons/fi';

const PedidoCard = ({ pedido, onUpdateEstado, mostrarAccionesMozo = false, esVistaMozo = false }) => {
  // Determinar si es un pedido de la vista mozo (nuevo formato) o del viejo
  const esPedidoMozo = esVistaMozo || pedido.mesa !== undefined; 
  
  
  // Usar el total que ya viene del backend
  const calcularTotal = () => {
    if (pedido.total !== undefined) {
      return pedido.total;
    }
    
    // Fallback: calcular manualmente
    if (!pedido.detalles) return 0;
    let total = 0;
    
    pedido.detalles.forEach(detalle => {
      const precioBase = (detalle.precioUnitario || 0) * (detalle.cantidad || 1);
      total += precioBase;
      
      if (detalle.extras && Array.isArray(detalle.extras)) {
        detalle.extras.forEach(extra => {
          if (typeof extra === 'object' && extra !== null && extra.precio) {
            total += extra.precio * detalle.cantidad;
          }
        });
      }
    });
    
    return total;
  };
    
  // Obtener mesa - compatible con ambos formatos
  const obtenerMesa = () => {
    if (esPedidoMozo) {
      return pedido.mesa || "Sin mesa";
    } else {
      return `Mesa ${pedido.mesaId || "?"}`;
    }
  };
  
  // Obtener estado - compatible con ambos formatos
  const obtenerEstado = () => {
    if (esPedidoMozo) {
      return pedido.estado || pedido.estadoGeneral || 'pendiente';
    } else {
      return pedido.estadoGeneral || 'pendiente';
    }
  };
  
  // Verificar si está listo para entregar - compatible con ambos formatos
  const estaListoParaEntregar = () => {
    if (esPedidoMozo) {
      // Nuevo formato: solo revisar el estado general
      return pedido.estado === 'completado';
    } else {
      // Viejo formato: lógica original
      const estadoComida = pedido.estadoComida || 'pendiente';
      const estadoBebida = pedido.estadoBebida || 'pendiente';
      
      const tieneComida = pedido.detalles?.some(d => 
        !d.itemNombre?.toLowerCase().match(/(jugo|gaseosa|café|té|agua|cerveza|vino|trago|bebida|refresco)/i)
      );
      
      const tieneBebida = pedido.detalles?.some(d => 
        d.itemNombre?.toLowerCase().match(/(jugo|gaseosa|café|té|agua|cerveza|vino|trago|bebida|refresco)/i)
      );
      
      if (tieneComida && tieneBebida) {
        return estadoComida === 'listo' && estadoBebida === 'listo';
      } else if (tieneComida) {
        return estadoComida === 'listo';
      } else if (tieneBebida) {
        return estadoBebida === 'listo';
      }
      
      return false;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow p-5 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">Pedido #{pedido.id} - {obtenerMesa()}</h3>
          <p className="text-gray-600 text-sm">
            {pedido.creadoEn ? `Creado el ${new Date(pedido.creadoEn).toLocaleString()}` : ''}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">
            S/ {calcularTotal().toFixed(2)}
          </p>
          <span className={`px-2 py-1 text-xs rounded ${
            obtenerEstado() === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
            obtenerEstado() === 'preparando' || obtenerEstado() === 'parcial' ? 'bg-orange-100 text-orange-800' :
            'bg-green-100 text-green-800'
          }`}>
            {obtenerEstado().toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Estados por área - solo para vista no-mozo */}
      {!esPedidoMozo && (
        <div className="grid grid-cols-2 gap-4 my-4">
          {/* Cocina */}
          <div className={`p-3 rounded-lg ${
            pedido.estadoComida === 'pendiente' ? 'bg-yellow-50' :
            pedido.estadoComida === 'preparando' ? 'bg-orange-50' :
            'bg-green-50'
          }`}>
            <div className="flex items-center mb-1">
              <FiCoffee className="mr-2" />
              <span className="font-medium">Cocina</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              pedido.estadoComida === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              pedido.estadoComida === 'preparando' ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }`}>
              {pedido.estadoComida?.toUpperCase() || 'PENDIENTE'}
            </span>
          </div>
          
          {/* Barra */}
          <div className={`p-3 rounded-lg ${
            pedido.estadoBebida === 'pendiente' ? 'bg-yellow-50' :
            pedido.estadoBebida === 'preparando' ? 'bg-blue-50' :
            'bg-green-50'
          }`}>
            <div className="flex items-center mb-1">
              <FiDroplet className="mr-2" />
              <span className="font-medium">Barra</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              pedido.estadoBebida === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              pedido.estadoBebida === 'preparando' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {pedido.estadoBebida?.toUpperCase() || 'PENDIENTE'}
            </span>
          </div>
        </div>
      )}
      
      {/* Detalles del pedido */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Artículos del pedido:</h4>
        {pedido.detalles?.map((detalle, idx) => (
          <div key={idx} className="mb-3 p-3 bg-gray-50 rounded">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{detalle.itemNombre}</p>
                <p className="text-sm text-gray-600">
                  Cantidad: {detalle.cantidad} • S/ {detalle.precioUnitario?.toFixed(2)} c/u
                </p>
              </div>
              <p className="font-bold">
                {esPedidoMozo && detalle.subtotal ? 
                  `S/ ${detalle.subtotal.toFixed(2)}` : 
                  `S/ ${(detalle.precioUnitario * detalle.cantidad).toFixed(2)}`}
              </p>
            </div>
            
            {/* Extras - compatible con ambos formatos */}
            {detalle.extras && detalle.extras.length > 0 && (
              <div className="ml-4 mt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Extras:</p>
                {detalle.extras.map((extra, extraIdx) => {
                  // Determinar si es string (viejo) o objeto (nuevo)
                  const esObjetoExtra = typeof extra === 'object' && extra !== null;
                  const nombreExtra = esObjetoExtra ? extra.nombre : extra;
                  const precioExtra = esObjetoExtra ? extra.precio : null;
                  
                  return (
                    <div key={extraIdx} className="ml-2 mb-1 text-sm flex justify-between">
                      <span className="text-gray-600">• {nombreExtra}</span>
                      {precioExtra && (
                        <span className="font-medium ml-2">S/ {precioExtra.toFixed(2)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Observaciones */}
            {detalle.observaciones && (
              <div className="ml-4 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Observaciones:</p>
                <p className="text-sm text-gray-600">{detalle.observaciones}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Acciones del mozo */}
      {mostrarAccionesMozo && (
        <div className="border-t pt-4 mt-4 flex justify-between">
          {/* Cancelar (solo si está pendiente) */}
          {(obtenerEstado() === 'pendiente') && (
            <button
              onClick={() => onUpdateEstado(pedido.id, 'cancelar')}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center"
            >
              <FiX className="mr-2" />
              Cancelar Pedido
            </button>
          )}
          
          {/* Marcar como entregado */}
          {estaListoParaEntregar() && (
            <button
              onClick={() => onUpdateEstado(pedido.id, 'entregado')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center"
            >
              <FiCheckCircle className="mr-2" />
              Marcar como Entregado
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PedidoCard;