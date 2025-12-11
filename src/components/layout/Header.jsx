import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiUser, FiBell } from 'react-icons/fi';

const Header = ({ title = "Sistema Restaurante" }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="text-2xl text-white">🍽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-600">
                {user ? `Rol: ${user.rol.toUpperCase()}` : 'No autenticado'}
              </p>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <FiUser className="text-gray-600" />
                  <span className="font-medium text-gray-800">{user.nombre}</span>
                </div>
                
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                  <FiBell size={20} />
                </button>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <FiLogOut />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;