import React from 'react';

const GraficoVentas = ({ ventasPorHora }) => {
  const maxVentas = Math.max(...ventasPorHora.map(v => v.monto), 0);
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ventas por hora (hoy)</h3>
      <div className="flex items-end h-48 space-x-2">
        {ventasPorHora.map((hora, index) => {
          const altura = maxVentas > 0 ? (hora.monto / maxVentas) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${altura}%` }}
              ></div>
              <div className="text-xs text-gray-600 mt-2">{hora.hora}</div>
              <div className="text-xs font-medium">S/ {hora.monto.toFixed(0)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraficoVentas;