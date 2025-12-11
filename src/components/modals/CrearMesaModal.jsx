import React, { useState } from 'react';
import { FiX, FiCoffee } from 'react-icons/fi';

const CrearMesaModal = ({ onClose, onConfirm }) => {
  const [numeroMesa, setNumeroMesa] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numeroMesa || isNaN(numeroMesa)) {
      alert('Por favor ingresa un número válido');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(numeroMesa);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiCoffee className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nueva Mesa</h2>
              <p className="text-gray-600">Agregar mesa al sistema</p>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Mesa *
            </label>
            <input
              type="number"
              value={numeroMesa}
              onChange={(e) => setNumeroMesa(e.target.value)}
              className="input-field"
              placeholder="Ej: 1, 2, 3..."
              min="1"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              El número debe ser único y no existir en el sistema
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">Información:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• La mesa se creará con estado "Libre"</li>
              <li>• Podrás cambiar el estado después</li>
              <li>• El número no podrá ser modificado</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <FiCoffee />
                  <span>Crear Mesa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearMesaModal;