import React, { useState } from 'react';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiPlus,
  FiEdit,
  FiCoffee,
  FiDroplet
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const MesaCard = ({ mesa, onSelectMesa, onCambiarEstado }) => {
  const [hover, setHover] = useState(false);

  const getEstadoInfo = () => {
    const estados = {
      'libre': {
        color: 'from-green-400 to-emerald-500',
        icon: <FiCheckCircle className="text-white" size={20} />,
        textColor: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Libre'
      },
      'ocupada': {
        color: 'from-red-400 to-pink-500',
        icon: <FiUsers className="text-white" size={20} />,
        textColor: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Ocupada'
      },
      'limpieza': {
        color: 'from-yellow-400 to-amber-500',
        icon: <FiClock className="text-white" size={20} />,
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Limpieza'
      }
    };
    
    return estados[mesa.estado] || estados['libre'];
  };

  const estadoInfo = getEstadoInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.03,
        y: -5,
        transition: { type: "spring", stiffness: 300 }
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
    >
      {/* Gradiente superior */}
      <div className={`h-2 bg-gradient-to-r ${estadoInfo.color}`}></div>
      
      {/* Contenido principal */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold text-gray-800">#{mesa.numero}</span>
              <motion.div
                animate={{ rotate: hover ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className={`px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 ${estadoInfo.bgColor} ${estadoInfo.textColor}`}
              >
                {estadoInfo.icon}
                <span>{estadoInfo.label}</span>
              </motion.div>
            </div>
            
            {mesa.capacidad && (
              <p className="text-gray-600 mt-2 flex items-center">
                <FiUsers className="mr-2" size={16} />
                Capacidad: {mesa.capacidad} personas
              </p>
            )}
          </div>
          
          {/* Indicador de tiempo si está ocupada */}
          {mesa.estado === 'ocupada' && mesa.horaOcupada && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Ocupada desde</p>
              <p className="font-bold text-gray-800">
                {new Date(mesa.horaOcupada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
        
        {/* Acciones */}
        <div className="mt-6 flex space-x-3">
          {mesa.estado === 'libre' ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectMesa(mesa)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg"
            >
              <FiPlus />
              <span>Crear Pedido</span>
            </motion.button>
          ) : mesa.estado === 'ocupada' ? (
            <div className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg">
              <FiCoffee />
              <span>Ver Pedido</span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-bold shadow-lg">
              <FiClock />
              <span>En Limpieza</span>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCambiarEstado(mesa)}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            <FiEdit />
          </motion.button>
        </div>
        
        {/* Indicadores */}
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <FiCoffee size={14} />
                <span>Comida: Pendiente</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiDroplet size={14} />
                <span>Bebida: Pendiente</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Efecto de brillo al hover */}
      {hover && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default MesaCard;