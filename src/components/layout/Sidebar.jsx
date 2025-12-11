import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiCoffee, 
  FiShoppingCart,
  FiBarChart2,
  FiSettings,
  FiTrendingUp // ← AGREGA ESTE ICONO
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();

  // Definir enlaces según el rol
  const getLinks = () => {
    const links = [
      { to: '/', icon: <FiHome />, label: 'Inicio', roles: ['admin', 'mozo', 'cocina', 'barra'] },
    ];

    if (user?.rol === 'mozo' || user?.rol === 'admin') {
      links.push(
        { to: '/mesas', icon: <FiCoffee />, label: 'Mesas', roles: ['mozo', 'admin'] },
        { to: '/pedidos', icon: <FiShoppingCart />, label: 'Pedidos', roles: ['mozo', 'admin'] }
      );
    }

    if (user?.rol === 'cocina' || user?.rol === 'admin') {
      links.push(
        { to: '/cocina', icon: <FiCoffee />, label: 'Cocina', roles: ['cocina', 'admin'] }
      );
    }

    if (user?.rol === 'barra' || user?.rol === 'admin') {
      links.push(
        { to: '/bar', icon: <FiCoffee />, label: 'Barra', roles: ['barra', 'admin'] }
      );
    }

    if (user?.rol === 'admin') {
      links.push(
        { to: '/admin-dashboard', icon: <FiTrendingUp />, label: 'Panel Admin', roles: ['admin'] }, // ← NUEVO
        { to: '/usuarios', icon: <FiUsers />, label: 'Usuarios', roles: ['admin'] },
        { to: '/config', icon: <FiSettings />, label: 'Configuración', roles: ['admin'] }
      );
      // Eliminé 'Reportes' ya que ahora está en Panel Admin
    }

    return links;
  };

  const links = getLinks();

  if (!user) return null;

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-6">Navegación</h2>
        <nav>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;