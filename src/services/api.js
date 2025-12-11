import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = 'http://localhost:8080/Apirest/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== SERVICIOS PRINCIPALES ==========

// 🔹 Autenticación
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData)
};

// 🔹 Mesas
export const mesaService = {
  getAll: () => api.get('/mesas'),
  getById: (id) => api.get(`/mesas/${id}`),
  getByEstado: (estado) => api.get(`/mesas/estado/${estado}`),
  updateEstado: (id, estado) => api.put(`/mesas/${id}/estado`, { estado }),
  create: (mesa) => api.post('/mesas', mesa),
  update: (id, mesa) => api.put(`/mesas/${id}`, mesa),
  delete: (id) => api.delete(`/mesas/${id}`),
  getOcupadas: () => api.get('/mesas/ocupadas'),
  getDisponibles: () => api.get('/mesas/disponibles')
};

// 🔹 Pedidos
export const pedidoService = {
  create: (data) => api.post('/pedidos', data),
  getAll: () => api.get('/pedidos'),
  getById: (id) => api.get(`/pedidos/${id}`),
  update: (id, data) => api.put(`/pedidos/${id}`, data),
  updateEstadoCocina: (id, estado) => api.put(`/pedidos/${id}/estado-cocina`, { estado }),
  updateEstadoBar: (id, estado) => api.put(`/pedidos/${id}/estado-bar`, { estado }),
  cancelar: (id, data) => api.put(`/pedidos/${id}/cancelar`, data),
  eliminar: (id) => api.delete(`/pedidos/${id}`),
  getActivos: () => api.get('/pedidos/activos'),
  getCancelados: () => api.get('/pedidos/eliminados'),
  getForCocina: () => api.get('/pedidos/cocina'),
  getForBar: () => api.get('/pedidos/bar'),
  getByMesa: (mesaId) => api.get(`/pedidos/mesa/${mesaId}`),
  getByEstado: (estado) => api.get(`/pedidos/estado/${estado}`),
  marcarComoEntregado: (id) => api.put(`/pedidos/${id}/entregado`),
  getParaMozo: (id) => api.get(`/pedidos/mozo/${id}`),
  getActivosParaMozo: () => api.get('/pedidos/mozo/activos'),
};

// 🔹 Items/Menú
export const itemService = {
  getAll: () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
  getAvailable: () => api.get('/items/disponibles'),
  getBySubcategoria: (subcategoriaId) => api.get(`/items/subcategoria/${subcategoriaId}`),
  getByCategoria: (categoriaId) => api.get(`/items/categoria/${categoriaId}`),
  getMasVendidos: () => api.get('/items/mas-vendidos'),
  updateAvailability: (id, disponible) => api.put(`/items/${id}/disponibilidad`, { disponible }),
  create: (item) => api.post('/items', item),
  update: (id, item) => api.put(`/items/${id}`, item),
  delete: (id) => api.delete(`/items/${id}`),
  getBebidas: () => api.get('/items/bebidas'),
  getComidas: () => api.get('/items/comidas')
  
};
// 🔹 GESTIÓN DE STOCK (servicio separado - RECOMENDADO)
export const stockService = {
  // Reportes
  getReport: () => api.get('/stock/reporte'),
  getLow: () => api.get('/stock/bajo'),
  getCritical: () => api.get('/stock/critico'),
  getOutOfStock: () => api.get('/stock/agotados'),
  
  // Operaciones individuales
  update: (data) => api.put('/stock/actualizar', data),
  
  // Operaciones rápidas (conveniencia)
  increase: (itemId, cantidad, motivo = '') => 
    api.put('/stock/actualizar', { itemId, cantidad, tipo: 'aumentar', motivo }),
    
  decrease: (itemId, cantidad, motivo = '') => 
    api.put('/stock/actualizar', { itemId, cantidad, tipo: 'disminuir', motivo }),
    
  set: (itemId, cantidad, motivo = '') => 
    api.put('/stock/actualizar', { itemId, cantidad, tipo: 'establecer', motivo }),
  
  // Operaciones múltiples
  restockMultiple: (items) => api.post('/stock/reabastecer', items),
  
  // Utilidades
  getItemStock: (itemId) => 
    api.get('/stock/reporte').then(response => {
      const item = response.data.find(item => item.itemId === itemId);
      return item ? item.stockActual : 0;
    }),
    
  checkStock: (itemId, cantidadNecesaria) =>
    api.get('/stock/reporte').then(response => {
      const item = response.data.find(item => item.itemId === itemId);
      return item ? item.stockActual >= cantidadNecesaria : false;
    })
};

// 🔹 Categorías - ESTE ES EL QUE FALTA
export const categoriaService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (categoria) => api.post('/categorias', categoria),
  update: (id, categoria) => api.put(`/categorias/${id}`, categoria),
  delete: (id) => api.delete(`/categorias/${id}`),
  getConItems: () => api.get('/categorias/con-items')
};

// 🔹 Subcategorías
export const subcategoriaService = {
  getAll: () => api.get('/subcategorias'),
  getById: (id) => api.get(`/subcategorias/${id}`),
  getByCategoria: (categoriaId) => api.get(`/subcategorias/categoria/${categoriaId}`),
  create: (subcategoria) => api.post('/subcategorias', subcategoria),
  update: (id, subcategoria) => api.put(`/subcategorias/${id}`, subcategoria),
  delete: (id) => api.delete(`/subcategorias/${id}`)
};

// 🔹 Extras
export const extraService = {
  getAll: () => api.get('/extras'),
  getById: (id) => api.get(`/extras/${id}`),
  getByTipo: (tipo) => api.get(`/extras/tipo/${tipo}`),
  create: (extra) => api.post('/extras', extra),
  update: (id, extra) => api.put(`/extras/${id}`, extra),
  delete: (id) => api.delete(`/extras/${id}`)
};

// 🔹 Usuarios
export const usuarioService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (usuario) => api.post('/usuarios', usuario),
  update: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  delete: (id) => api.delete(`/usuarios/${id}`),
  getByRol: (rol) => api.get(`/usuarios/rol/${rol}`)
};

export const adminService = {
  getEstadisticas: () => api.get('/pedidos/admin/estadisticas'),
  getVentasPorHora: () => api.get('/pedidos/admin/ventas-por-hora'),
  getReporteDiario: (fecha) => api.get(`/pedidos/admin/reporte/${fecha}`),
};

// ========== FUNCIONES AUXILIARES ==========

// 🔹 Función para probar conexión
export const testConnection = async () => {
  try {
    const response = await api.get('/mesas', { timeout: 5000 });
    return {
      success: true,
      message: '✅ Conexión exitosa',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Error de conexión: ${error.message}`,
      error: error.response?.data || error.message
    };
  }
};

// 🔹 Health Check mejorado
export const healthCheck = async () => {
  try {
    const response = await api.get('/mesas', { timeout: 3000 });
    return {
      success: true,
      message: '✅ Backend conectado',
      status: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ No se pudo conectar: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// 🔹 Funciones de sesión
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData));
};

export const clearSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  delete api.defaults.headers.common['Authorization'];
};

// 🔹 Manejo de errores
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400: return data.message || 'Solicitud incorrecta';
      case 401: 
        clearSession();
        return 'Sesión expirada. Inicie sesión nuevamente';
      case 403: return 'No tiene permisos para esta acción';
      case 404: return 'Recurso no encontrado';
      case 409: return 'Conflicto con el estado actual';
      case 422: return data.errors?.map(e => e.msg).join(', ') || 'Error de validación';
      case 500: return 'Error interno del servidor';
      default: return data.message || 'Error en la comunicación';
    }
  } else if (error.request) {
    return 'No se pudo conectar con el servidor';
  } else {
    return error.message || 'Error desconocido';
  }
};

// Exportar por defecto
export default api;