import React, { useState } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiBell, 
  FiDollarSign, 
  FiCoffee,
  FiClock,
  FiPercent,
  FiDatabase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Config = () => {
  const [config, setConfig] = useState({
    nombreRestaurante: 'Mi Restaurante',
    direccion: 'Av. Principal 123',
    telefono: '+51 123 456 789',
    ruc: '20123456781',
    
    horaApertura: '08:00',
    horaCierre: '22:00',
    
    igv: 18,
    propinaSugerida: 10,
    
    notificarPedidosNuevos: true,
    notificarPedidosListos: true,
    notificarStockBajo: true,
    
    stockMinimo: 5,
    alertaStock: true,
    
    
    tiempoMaximoEspera: 30,
    autoImprimirComandas: false
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    // Guardar en localStorage para que el boucher lo use
    localStorage.setItem('restaurant_config', JSON.stringify(config));
    
    toast.success('Configuración guardada');
    setSaving(false);
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Personaliza el comportamiento del sistema
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
        >
          <FiSave />
          <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {/* Secciones de configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Información del Restaurante */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiCoffee className="text-orange-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Información del Restaurante</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUC
            </label>
            <input
              type="text"
              value={config.ruc || ''}
              onChange={(e) => handleChange('ruc', e.target.value)}
              className="input-field"
              placeholder="Ej: 20123456781"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Restaurante
              </label>
              <input
                type="text"
                value={config.nombreRestaurante}
                onChange={(e) => handleChange('nombreRestaurante', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={config.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={config.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiClock className="text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Horarios</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Apertura
              </label>
              <input
                type="time"
                value={config.horaApertura}
                onChange={(e) => handleChange('horaApertura', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={config.horaCierre}
                onChange={(e) => handleChange('horaCierre', e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo máximo de espera (minutos)
              </label>
              <input
                type="number"
                value={config.tiempoMaximoEspera}
                onChange={(e) => handleChange('tiempoMaximoEspera', parseInt(e.target.value))}
                className="input-field"
                min="5"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Impuestos y Propinas */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiPercent className="text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Impuestos y Propinas</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IGV (%)
              </label>
              <input
                type="number"
                value={config.igv}
                onChange={(e) => handleChange('igv', parseFloat(e.target.value))}
                className="input-field"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propina Sugerida (%)
              </label>
              <input
                type="number"
                value={config.propinaSugerida}
                onChange={(e) => handleChange('propinaSugerida', parseFloat(e.target.value))}
                className="input-field"
                min="0"
                max="30"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiBell className="text-purple-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Notificar nuevos pedidos</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificarPedidosNuevos}
                  onChange={(e) => handleChange('notificarPedidosNuevos', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Notificar pedidos listos</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificarPedidosListos}
                  onChange={(e) => handleChange('notificarPedidosListos', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Alertas de stock bajo</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.alertaStock}
                  onChange={(e) => handleChange('alertaStock', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiDatabase className="text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Gestión de Inventario</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo para Alerta
              </label>
              <input
                type="number"
                value={config.stockMinimo}
                onChange={(e) => handleChange('stockMinimo', parseInt(e.target.value))}
                className="input-field"
                min="1"
                max="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Se mostrará alerta cuando el stock esté por debajo de {config.stockMinimo} unidades
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Auto-imprimir comandas</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoImprimirComandas}
                  onChange={(e) => handleChange('autoImprimirComandas', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <FiSettings className="text-gray-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Configuración del Sistema</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Sistema
              </label>
              <input
                type="text"
                value="REST-2024-001"
                className="input-field bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Versión
              </label>
              <input
                type="text"
                value="v1.0.0"
                className="input-field bg-gray-100"
                disabled
              />
            </div>
            
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de reiniciar todas las configuraciones?')) {
                    setConfig({
                      nombreRestaurante: 'Mi Restaurante',
                      direccion: 'Av. Principal 123',
                      telefono: '+51 123 456 789',
                      horaApertura: '08:00',
                      horaCierre: '22:00',
                      igv: 18,
                      propinaSugerida: 10,
                      notificarPedidosNuevos: true,
                      notificarPedidosListos: true,
                      notificarStockBajo: true,
                      stockMinimo: 5,
                      alertaStock: true,
                      tiempoMaximoEspera: 30,
                      autoImprimirComandas: false
                    });
                    toast.info('Configuración restablecida a valores predeterminados');
                  }
                }}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
              >
                Restablecer Valores
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;