import React from 'react';
import { FiX, FiCoffee, FiDroplet, FiClock, FiCheckCircle, FiUser, FiCreditCard } from 'react-icons/fi';

const VerPedidoModal = ({ pedido, onClose, onUpdateEstado }) => {
  // cccalcular total de extras
  const calcularTotalExtras = (detalle) => {
    return detalle.extras?.reduce((total, extra) => {
      const precio = typeof extra === 'object' ? extra.precio : 0;
      return total + (precio || 0) * detalle.cantidad;
    }, 0) || 0;
  };

  // cccalcular subtotal por detalle
  const calcularSubtotalDetalle = (detalle) => {
    const precioBase = (detalle.precioUnitario || 0) * detalle.cantidad;
    return precioBase + calcularTotalExtras(detalle);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiCoffee className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Pedido #{pedido.id} - Mesa {pedido.mesaId}
              </h2>
              <p className="text-gray-600">
                Creado el {new Date(pedido.creadoEn).toLocaleString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiClock className="text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Estado General</p>
                    <p className="text-lg font-bold">{pedido.estadoGeneral}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiCoffee className="text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Cocina</p>
                    <p className="text-lg font-bold">{pedido.estadoComida}</p>
                  </div>
                </div>
                {pedido.estadoComida === 'pendiente' && (
                  <button
                    onClick={() => onUpdateEstado(pedido.id, 'cocina', 'preparando')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Iniciar
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiDroplet className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Barra</p>
                    <p className="text-lg font-bold">{pedido.estadoBebida}</p>
                  </div>
                </div>
                {pedido.estadoBebida === 'pendiente' && (
                  <button
                    onClick={() => onUpdateEstado(pedido.id, 'bar', 'preparando')}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                  >
                    Iniciar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Detalles del pedido */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Items del pedido</h3>
            <div className="space-y-4">
              {pedido.detalles?.map((detalle, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{detalle.itemNombre}</h4>
                      <p className="text-sm text-gray-600">
                        Cantidad: {detalle.cantidad} • S/ {detalle.precioUnitario?.toFixed(2)} c/u
                      </p>
                    </div>
                    <span className="font-bold">
                      S/ {calcularSubtotalDetalle(detalle).toFixed(2)}
                    </span>
                  </div>

                  {/* Extras */}
                  {detalle.extras && detalle.extras.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Extras:</p>
                      <div className="space-y-1">
                        {detalle.extras.map((extra, idx) => {
                          const esObjeto = typeof extra === 'object';
                          const nombre = esObjeto ? extra.nombre : extra;
                          const precio = esObjeto ? extra.precio : null;
                          
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">• {nombre}</span>
                              {precio && (
                                <span className="font-medium text-green-600">
                                  S/ {precio.toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Observaciones */}
                  {detalle.observaciones && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Observaciones:</p>
                      <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                        {detalle.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Subtotal items:</span>
              <span className="font-medium">
                S/ {pedido.detalles?.reduce((sum, d) => sum + (d.precioUnitario || 0) * d.cantidad, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Extras:</span>
              <span className="font-medium">
                S/ {pedido.detalles?.reduce((sum, d) => sum + calcularTotalExtras(d), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-300">
              <span className="text-lg font-bold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                S/ {Number(pedido.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cerrar
            </button>
            {(pedido.estadoComida === 'listo' && pedido.estadoBebida === 'listo') && (
              <button
                onClick={() => {
                  onUpdateEstado(pedido.id, 'general', 'entregado');
                  onClose();
                }}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                Marcar como Entregado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerPedidoModal;