import React, { useState } from 'react';
import { 
  FiClock, 
  FiCoffee, 
  FiCheckCircle, 
  FiAlertCircle,
  FiMessageSquare,
  FiUser,
  FiFlag,
  FiX,
  FiDroplet,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CocinaPedidoCard = ({ pedido, onUpdateEstado, onCancelSuccess }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [hover, setHover] = useState(false);
  
  const estado = pedido.estadoComida || 'pendiente';
  const puedeCancelar = estado === 'pendiente';
  
  const estadoBebida = pedido.estadoBebida || 'pendiente';
  const comidas = pedido.detalles?.filter(detalle => 
    !detalle.itemNombre?.toLowerCase().match(/(jugo|gaseosa|café|agua|cerveza|vino|trago|bebida)/)
  ) || [];

  const formatearHora = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return format(fecha, 'HH:mm', { locale: es });
    } catch {
      return '--:--';
    }
  };

  const calcularTiempo = (fechaString) => {
    try {
      const ahora = new Date();
      const creado = new Date(fechaString);
      const minutos = Math.floor((ahora - creado) / (1000 * 60));
      
      if (minutos < 1) return 'Recién';
      if (minutos < 60) return `${minutos} min`;
      
      const horas = Math.floor(minutos / 60);
      return `${horas}h ${minutos % 60}m`;
    } catch {
      return '--';
    }
  };

  const minutosEspera = (() => {
    try {
      const ahora = new Date();
      const creado = new Date(pedido.creadoEn);
      return Math.floor((ahora - creado) / (1000 * 60));
    } catch {
      return 0;
    }
  })();

  const getEstadoColor = () => {
    if (estado === 'pendiente') {
      return minutosEspera > 20 
        ? 'from-red-500 to-red-600' 
        : 'from-yellow-500 to-amber-600';
    }
    if (estado === 'preparando') return 'from-orange-500 to-red-500';
    if (estado === 'listo') return 'from-green-500 to-emerald-600';
    return 'from-gray-500 to-gray-600';
  };

  const getBebidaIcon = () => {
    if (estadoBebida === 'pendiente') return '⏳';
    if (estadoBebida === 'preparando') return '🍹';
    if (estadoBebida === 'listo') return '✅';
    return '🍶';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${
        estado === 'preparando' ? 'border-orange-200' :
        estado === 'listo' ? 'border-green-200' :
        'border-gray-200'
      }`}
    >
      {/* Header con gradiente */}
      <div className={`bg-gradient-to-r ${getEstadoColor()} p-6 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl font-bold">#{pedido.id}</span>
              <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                Mesa {pedido.mesaId}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiClock />
                <span>{formatearHora(pedido.creadoEn)}</span>
              </div>
              
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                minutosEspera < 10 ? 'bg-green-500/30' :
                minutosEspera < 20 ? 'bg-yellow-500/30' :
                'bg-red-500/30'
              }`}>
                ⏱️ {calcularTiempo(pedido.creadoEn)}
              </div>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: hover ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="text-right"
          >
            <div className="text-2xl font-bold">
              {comidas.reduce((sum, d) => sum + d.cantidad, 0) || 0} platos
            </div>
            <div className="text-sm opacity-80">
              Estado: {estado.toUpperCase()}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Estado de bebida */}
      {estadoBebida !== 'pendiente' && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-2 text-blue-700">
            <span className="text-lg">{getBebidaIcon()}</span>
            <span className="text-sm font-medium">
              Bebida: {estadoBebida === 'preparando' ? 'En preparación en barra' : 
                      estadoBebida === 'listo' ? 'Lista en barra' : 'Pendiente en barra'}
            </span>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="p-6">
        {/* Items */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {comidas.slice(0, 4).map((detalle, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-full text-sm flex items-center space-x-1 border border-orange-200"
              >
                <span className="font-bold">{detalle.cantidad}x</span>
                <span>{detalle.itemNombre}</span>
              </motion.div>
            ))}
            
            {comidas.length > 4 && (
              <div className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                +{comidas.length - 4} más
              </div>
            )}
          </div>
        </div>
        
        {/* Botón ver detalles */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMostrarDetalles(!mostrarDetalles)}
          className="w-full py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition mb-4 flex items-center justify-center space-x-2"
        >
          {mostrarDetalles ? (
            <>
              <FiChevronUp />
              <span>Ocultar detalles</span>
            </>
          ) : (
            <>
              <FiChevronDown />
              <span>Ver detalles de comidas</span>
            </>
          )}
        </motion.button>
        
        {/* Detalles expandidos */}
        <AnimatePresence>
          {mostrarDetalles && comidas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4 mb-4"
            >
              <h4 className="font-bold text-gray-700 mb-3">Detalles de las comidas:</h4>
              <div className="space-y-3">
                {comidas.map((detalle, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-orange-50 rounded-xl p-4 border border-orange-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-gray-800">{detalle.itemNombre}</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Cantidad: {detalle.cantidad} • S/ {detalle.precioUnitario?.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-orange-600">
                        S/ {(detalle.precioUnitario * detalle.cantidad).toFixed(2)}
                      </span>
                    </div>
                    
                    {detalle.observaciones && (
                      <div className="mt-3">
                        <div className="flex items-start space-x-2">
                          <FiMessageSquare className="text-orange-500 mt-0.5 flex-shrink-0" size={14} />
                          <p className="text-sm text-orange-700 italic">
                            "{detalle.observaciones}"
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Botones de acción */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {puedeCancelar && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCancelSuccess(pedido)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
              >
                <FiX />
                <span className="text-sm font-medium">Cancelar</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {/* TODO: Marcar como urgente */}}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-xl transition"
            >
              <FiAlertCircle />
              <span className="text-sm font-medium">Urgente</span>
            </motion.button>
          </div>
          
          <div className="flex space-x-2">
            {estado === 'pendiente' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateEstado(pedido.id, 'preparando')}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg"
              >
                🍳 Iniciar Preparación
              </motion.button>
            )}
            
            {estado === 'preparando' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateEstado(pedido.id, 'listo')}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg"
              >
                Marcar como Listo
              </motion.button>
            )}
            
            {estado === 'listo' && (
              <div className="flex items-center space-x-2 text-green-600 font-bold">
                <FiCheckCircle />
                <span>Comida lista</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CocinaPedidoCard;