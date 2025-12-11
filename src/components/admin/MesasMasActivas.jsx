import React from 'react';

const MesasMasActivas = ({ mesas }) => {
  if (!mesas || mesas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Mesas más activas</h3>
        <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Mesas más activas (hoy)</h3>
      <div className="space-y-3">
        {mesas.map((mesa, index) => (
          <div key={mesa.mesaId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">Mesa #{mesa.numero}</p>
                <p className="text-sm text-gray-600">{mesa.totalPedidos} pedidos</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              index === 0 ? 'bg-yellow-100 text-yellow-800' :
              index === 1 ? 'bg-gray-100 text-gray-800' :
              index === 2 ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MesasMasActivas;