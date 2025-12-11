import React, { useState } from 'react';
import { FiX, FiCoffee, FiUsers, FiClock } from 'react-icons/fi';

const CambiarEstadoModal = ({ mesa, onClose, onConfirm }) => {
  const [nuevoEstado, setNuevoEstado] = useState(mesa.estado);

  const estados = [
    { value: 'libre', label: 'Libre', icon: <FiCoffee />, color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'ocupada', label: 'Ocupada', icon: <FiUsers />, color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'limpieza', label: 'Limpieza', icon: <FiClock />, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nuevoEstado !== mesa.estado) {
      onConfirm(mesa.id, nuevoEstado);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cambiar Estado</h2>
            <p className="text-gray-600">Mesa #{mesa.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona el nuevo estado:
            </label>
            
            <div className="space-y-3">
              {estados.map((estado) => (
                <label
                  key={estado.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${estado.color} ${
                    nuevoEstado === estado.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value={estado.value}
                    checked={nuevoEstado === estado.value}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3">
                    {estado.icon}
                    <span className="font-medium">{estado.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              disabled={nuevoEstado === mesa.estado}
            >
              Confirmar Cambio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambiarEstadoModal;