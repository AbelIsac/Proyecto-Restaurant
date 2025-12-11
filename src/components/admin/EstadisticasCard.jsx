import React from 'react';

const EstadisticasCard = ({ icono, titulo, valor, color, descripcion }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{titulo}</p>
          <h3 className={`text-3xl font-bold mt-2 ${color}`}>{valor}</h3>
          {descripcion && (
            <p className="text-sm text-gray-500 mt-1">{descripcion}</p>
          )}
        </div>
        <div className="text-3xl">
          {icono}
        </div>
      </div>
    </div>
  );
};

export default EstadisticasCard;