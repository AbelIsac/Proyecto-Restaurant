
import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiCalendar, FiUser } from 'react-icons/fi';
import { pedidoService } from '../../services/api';
import { toast } from 'react-hot-toast';

const HistorialCancelaciones = ({ isOpen, onClose }) => {
  const [cancelaciones, setCancelaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      cargarCancelaciones();
    }
  }, [isOpen]);

  const cargarCancelaciones = async () => {
    try {
      setLoading(true);
      const response = await pedidoService.getCancelados();
      setCancelaciones(response.data);
    } catch (error) {
      toast.error('Error cargando historial de cancelaciones');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Historial de Cancelaciones</h2>
              <p className="text-gray-600">Pedidos cancelados en el sistema</p>
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
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando historial...</p>
            </div>
          ) : cancelaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700">Sin cancelaciones</h3>
              <p className="text-gray-600 mt-2">No hay pedidos cancelados en el sistema</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelaciones.map((cancelacion) => (
                <div key={cancelacion.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-lg text-gray-800">
                          Pedido #{cancelacion.id}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Cancelado
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <FiUser className="text-gray-500" size={14} />
                          <span className="text-sm">Mesa: {cancelacion.mesaId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-gray-500" size={14} />
                          <span className="text-sm">
                            {new Date(cancelacion.eliminadoEn).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiUser className="text-gray-500" size={14} />
                          <span className="text-sm">
                            Usuario: {cancelacion.usuarioCancelacion?.nombre || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded p-3 border border-red-100">
                        <p className="font-medium text-red-800 mb-1">Razón de cancelación:</p>
                        <p className="text-red-700">{cancelacion.razonCancelacion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Total: {cancelaciones.length} cancelaciones registradas
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistorialCancelaciones;