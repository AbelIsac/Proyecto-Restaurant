import React from 'react';

const ItemsMasVendidos = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Items más vendidos</h3>
        <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Items más vendidos (hoy)</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{item.nombre}</p>
                <p className="text-sm text-gray-600">{item.cantidadVendida} unidades</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">+{item.cantidadVendida}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsMasVendidos;