import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(nombre, password);
    
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  // Usuarios de prueba (los que tienes en tu BD)
  const usuariosDemo = [
    { nombre: 'Carlos Mendoza', password: '123456', rol: 'mozo' },
    { nombre: 'Ana Torres', password: '123456', rol: 'mozo' },
    { nombre: 'Luis Ramírez', password: '123456', rol: 'cocina' },
    { nombre: 'María González', password: '123456', rol: 'cocina' },
    { nombre: 'Jorge Silva', password: '123456', rol: 'barra' },
    { nombre: 'Elena Castro', password: '123456', rol: 'barra' },
    { nombre: 'Admin Principal', password: 'admin123', rol: 'admin' }
  ];

  const fillDemo = (usuario) => {
    setNombre(usuario.nombre);
    setPassword(usuario.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Encabezado */}
        <div className="bg-restaurant-primary p-8 text-center">
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Sistema Restaurante</h1>
          <p className="text-blue-100 mt-2">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Ej: Carlos Mendoza"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Botón Login */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary py-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Usuarios de demostración */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Usuarios de prueba:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {usuariosDemo.map((usuario, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillDemo(usuario)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-left transition"
                >
                  <div className="font-medium">{usuario.nombre.split(' ')[0]}</div>
                  <div className="text-gray-500">Rol: {usuario.rol}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-sm text-gray-600">
            Sistema de Gestión de Restaurante v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;