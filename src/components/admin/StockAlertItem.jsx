// components/admin/StockAlertItem.jsx
import React, { useState } from 'react';
import { FiPackage, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { itemService } from '../../services/api';
import { toast } from 'react-hot-toast';

const StockAlertItem = ({ alerta }) => {
  const [cantidad, setCantidad] = useState(20);
  const [actualizando, setActualizando] = useState(false);

  const handleReabastecer = async () => {
    if (cantidad <= 0) {
      toast.error('Ingrese una cantidad válida');
      return;
    }

    try {
      setActualizando(true);
      await itemService.actualizarStock({
        itemId: alerta.id,
        cantidad: cantidad,
        tipo: 'aumentar',
        motivo: 'reabastecimiento desde dashboard'
      });
      
      toast.success(`${alerta.nombre} reabastecido con ${cantidad} unidades`);
      // Recargar datos después de 2 segundos
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error('Error al reabastecer');
    } finally {
      setActualizando(false);
    }
  };

  // Icono según severidad
  const getIcon = () => {
    switch (alerta.severidad) {
      case 'critico': return <FiAlertTriangle className="text-red-600" />;
      case 'bajo': return <FiAlertTriangle className="text-yellow-600" />;
      case 'agotado': return <FiPackage className="text-gray-600" />;
      default: return <FiCheckCircle className="text-green-600" />;
    }
  };

  // Color de texto según severidad
  const getColor = () => {
    switch (alerta.severidad) {
      case 'critico': return 'text-red-700';
      case 'bajo': return 'text-yellow-700';
      case 'agotado': return 'text-gray-700';
      default: return 'text-green-700';
    }
  };

  // Texto descriptivo
  const getDescripcion = () => {
    switch (alerta.severidad) {
      case 'critico': return 'Stock CRÍTICO - ¡Reabastecer URGENTE!';
      case 'bajo': return 'Stock BAJO - Reabastecer pronto';
      case 'agotado': return 'AGOTADO - Sin stock disponible';
      default: return 'Stock normal';
    }
  };

  return (
    <div className="transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full mr-3 ${
            alerta.severidad === 'critico' ? 'bg-red-200' :
            alerta.severidad === 'bajo' ? 'bg-yellow-200' :
            'bg-gray-200'
          }`}>
            {getIcon()}
          </div>
          <div>
            <p className="font-medium">{alerta.nombre}</p>
            <p className="text-sm text-gray-600">
              {alerta.categoria} {alerta.subcategoria && `• ${alerta.subcategoria}`}
            </p>
            <p className={`text-xs font-medium mt-1 ${getColor()}`}>
              {getDescripcion()}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-2xl font-bold ${getColor()}`}>
            {alerta.stock} u.
          </p>
          <p className="text-xs text-gray-500">
            Mínimo: {alerta.stockMinimo} u.
          </p>
        </div>
      </div>
      
      {/* Formulario para reabastecer */}
      <div className="flex items-center justify-end mt-3 space-x-2">
        <input
          type="number"
          min="1"
          max="1000"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Cantidad"
        />
        <button
          onClick={handleReabastecer}
          disabled={actualizando}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            alerta.severidad === 'critico' 
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : alerta.severidad === 'bajo'
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {actualizando ? (
            <FiRefreshCw className="animate-spin mr-2" />
          ) : null}
          {actualizando ? 'Actualizando...' : 'Reabastecer'}
        </button>
      </div>
    </div>
  );
};

export default StockAlertItem;