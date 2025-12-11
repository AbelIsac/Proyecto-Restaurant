import React, { useState } from 'react';
import { FiCheck, FiPlus } from 'react-icons/fi';

const ExtraSelector = ({ extras, seleccionados = [], onChange }) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const toggleExtra = (extraId) => {
    const nuevosExtras = seleccionados.includes(extraId)
      ? seleccionados.filter(id => id !== extraId)
      : [...seleccionados, extraId];
    
    onChange(nuevosExtras);
  };

  // Limitar a 3 extras por defecto
  const extrasVisibles = mostrarTodos ? extras : extras.slice(0, 3);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-700 mb-3">Extras opcionales</h4>
      
      {extras.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay extras disponibles</p>
      ) : (
        <>
          <div className="space-y-2">
            {extrasVisibles.map((extra) => (
              <label
                key={extra.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                  seleccionados.includes(extra.id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 flex items-center justify-center rounded border ${
                    seleccionados.includes(extra.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {seleccionados.includes(extra.id) && (
                      <FiCheck className="text-white" size={12} />
                    )}
                  </div>
                  <span className="font-medium">{extra.nombre}</span>
                </div>
                <span className="font-bold text-green-600">
                  +S/ {extra.precio?.toFixed(2) || '0.00'}
                </span>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(extra.id)}
                  onChange={() => toggleExtra(extra.id)}
                  className="hidden"
                />
              </label>
            ))}
          </div>

          {extras.length > 3 && (
            <button
              type="button"
              onClick={() => setMostrarTodos(!mostrarTodos)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-3 text-sm"
            >
              <FiPlus />
              <span>{mostrarTodos ? 'Mostrar menos' : `Ver todos (${extras.length})`}</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ExtraSelector;