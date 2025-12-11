import React, { useState } from 'react';
import { FiPlus, FiMinus, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ItemCard = ({ 
  item, 
  onAddToOrder, 
  onRemoveFromOrder, 
  cantidad = 0
  // SIN getDefaultImage
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const handleAdd = () => {
    onAddToOrder(item);
  };

  const handleRemove = () => {
    onRemoveFromOrder(item.id);
  };

  // URL SIMPLE - Directamente del backend
  const imageUrl = item.imagenUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* IMAGEN DEL ITEM */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={item.nombre}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imgLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => {
            setImgLoading(false);
            setImgError(false);
          }}
          onError={() => {
            console.error('❌ Error cargando imagen:', item.nombre, imageUrl);
            setImgError(true);
            setImgLoading(false);
          }}
        />
        
        {/* Badge de stock */}
        {item.stock !== undefined && (
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
            item.stock === 0 ? 'bg-red-500 text-white' :
            item.stock < 5 ? 'bg-orange-500 text-white' :
            'bg-green-500 text-white'
          }`}>
            {item.stock === 0 ? 'AGOTADO' : `${item.stock} DISP.`}
          </div>
        )}
        
        {/* Badge de categoría */}
        {item.subcategoria?.nombre && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
            {item.subcategoria.nombre}
          </div>
        )}
      </div>

      {/* INFO DEL ITEM */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg mb-1">{item.nombre}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {item.descripcion || 'Sin descripción'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-600 text-xl">
                S/ {item.precio?.toFixed(2) || '0.00'}
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                >
                  <FiInfo size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE CANTIDAD */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            {cantidad > 0 && (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemove}
                  className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
                >
                  <FiMinus size={18} />
                </motion.button>
                <span className="font-bold text-gray-800 min-w-[30px] text-center text-lg">
                  {cantidad}
                </span>
              </>
            )}
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAdd}
              disabled={item.disponible === 0 || (item.stock !== undefined && item.stock === 0)}
              className={`p-2 rounded-full transition ${
                item.disponible === 1 && (item.stock === undefined || item.stock > 0)
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiPlus size={18} />
            </motion.button>
          </div>
          
          {cantidad > 0 && (
            <span className="font-bold text-blue-600 text-lg">
              S/ {(item.precio * cantidad).toFixed(2)}
            </span>
          )}
        </div>

        {/* INDICADOR DE STOCK BAJO */}
        {item.stock !== undefined && item.stock > 0 && item.stock < 5 && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-orange-700 text-sm">
              <FiAlertCircle className="mr-2" size={14} />
              <span>Stock bajo: {item.stock} unidades restantes</span>
            </div>
          </div>
        )}

        {/* DETALLES EXPANDIDOS */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong className="text-gray-700">Categoría:</strong> {item.categoria?.nombre || item.subcategoria?.categoria?.nombre || 'N/A'}</p>
              <p><strong className="text-gray-700">Subcategoría:</strong> {item.subcategoria?.nombre || 'N/A'}</p>
              {item.stock !== undefined && (
                <p><strong className="text-gray-700">Stock inicial:</strong> {item.stock} unidades</p>
              )}
              {item.imagenUrl && (
                <p><strong className="text-gray-700">URL Imagen:</strong> 
                  <span className="text-xs block truncate">{item.imagenUrl}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ItemCard;