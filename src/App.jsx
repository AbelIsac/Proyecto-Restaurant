import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mesas from './pages/Mesas';
import Pedidos from './pages/Pedidos';
import Cocina from './pages/Cocina';
import Bar from './pages/Bar';
import Usuarios from './pages/Usuarios';
import Config from './pages/Config';
import AdminDashboard from './pages/AdminDashboard';
import DetallePedidoPage from './pages/DetallePedidoPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Ruta raíz - Dashboard según rol */}
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard /> {/* Este es el dashboard principal */}
            </PrivateRoute>
          } />
          
          {/* Panel de Administración ESPECÍFICO */}
          <Route path="/admin-dashboard" element={
            <PrivateRoute allowedRoles={['admin', 'gerente']}>
              <AdminDashboard /> {/* Este es el dashboard avanzado */}
            </PrivateRoute>
          } />

          {/* NUEVA RUTA: Detalle de Pedido */}
          <Route path="/admin/pedido/:id" element={
            <PrivateRoute allowedRoles={['admin', 'gerente']}>
              <DetallePedidoPage />
            </PrivateRoute>
          } />
          
          <Route path="/mesas" element={
            <PrivateRoute allowedRoles={['mozo', 'admin']}>
              <Mesas />
            </PrivateRoute>
          } />
          
          <Route path="/pedidos" element={
            <PrivateRoute allowedRoles={['mozo', 'admin']}>
              <Pedidos />
            </PrivateRoute>
          } />
          
          <Route path="/cocina" element={
            <PrivateRoute allowedRoles={['cocina', 'admin']}>
              <Cocina />
            </PrivateRoute>
          } />
          
          <Route path="/bar" element={
            <PrivateRoute allowedRoles={['barra', 'admin']}>
              <Bar />
            </PrivateRoute>
          } />
          
          <Route path="/usuarios" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Usuarios />
            </PrivateRoute>
          } />
          
          <Route path="/config" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Config />
            </PrivateRoute>
          } />

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;