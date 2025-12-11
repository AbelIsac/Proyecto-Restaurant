import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiPlus, 
  FiFilter, 
  FiRefreshCw, 
  FiSearch,
  FiHome,
  FiUsers,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { mesaService, pedidoService } from '../services/api';
import MesaCard from '../components/common/MesaCard';
import CambiarEstadoModal from '../components/modals/CambiarEstadoModal';
import CrearMesaModal from '../components/modals/CrearMesaModal';
import { toast } from 'react-hot-toast';
import CrearPedidoModal from '../components/modals/CrearPedidoModal';

const Mesas = () => {
  const [mesas, setMesas] = useState([]);
  const [filteredMesas, setFilteredMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas');
  const [modalCrearPedido, setModalCrearPedido] = useState(null);
  
  const [modalCambiarEstado, setModalCambiarEstado] = useState(null);
  const [modalCrearMesa, setModalCrearMesa] = useState(false);

  // Cargar mesas CON useCallback para evitar renders infinitos
  const cargarMesas = useCallback(async () => {
    console.log('🔍 EJECUTANDO cargarMesas...');
    
    try {
      setLoading(true);
      console.log('🔄 Estado loading cambiado a TRUE');
      
      const response = await mesaService.getAll();
      console.log('✅ Datos recibidos:', response.data);
      
      // ACTUALIZAR AMBOS ESTADOS JUNTOS
      setMesas(response.data);
      setFilteredMesas(response.data);
      
      console.log(`✅ ${response.data.length} mesas establecidas en estado`);
      
      if (response.data.length === 0) {
        toast.info('No hay mesas registradas. Crea la primera mesa.');
      } else {
        toast.success(`${response.data.length} mesas cargadas`);
      }
      
    } catch (error) {
      console.error('❌ Error cargando mesas:', error);
      toast.error('Error al cargar las mesas');
      
      // Establecer arrays vacíos en caso de error
      setMesas([]);
      setFilteredMesas([]);
      
    } finally {
      console.log('🏁 FINALLY: Cambiando loading a FALSE');
      // Usar setTimeout para forzar un nuevo ciclo de render
      setTimeout(() => {
        setLoading(false);
        console.log('✅ Loading cambiado a FALSE (con timeout)');
      }, 0);
    }
  }, []);

  // useEffect para cargar inicialmente
  useEffect(() => {
    console.log('🎯 useEffect se ejecutó, cargando mesas...');
    cargarMesas();
    
    // Elimina el timeout de emergencia que interfería
  }, [cargarMesas]);

  // Filtrar mesas
  useEffect(() => {
    console.log('🔍 Ejecutando filtro...', { 
      mesasCount: mesas.length, 
      search, 
      filter 
    });
    
    let resultado = mesas;

    if (search) {
      resultado = resultado.filter(mesa =>
        mesa.numero.toString().includes(search.toLowerCase())
      );
    }

    if (filter !== 'todas') {
      resultado = resultado.filter(mesa => mesa.estado === filter);
    }

    setFilteredMesas(resultado);
    console.log('✅ Filtro completado:', { 
      original: mesas.length, 
      filtrado: resultado.length 
    });
  }, [search, filter, mesas]);

  // Debug: Ver estados
  useEffect(() => {
    console.log('📊 Estado actualizado:', {
      loading,
      mesasCount: mesas.length,
      filteredCount: filteredMesas.length
    });
  }, [loading, mesas, filteredMesas]);

  // Función para manejar creación de pedido
  const handleCrearPedido = async (pedidoData) => {
    try {
      const response = await pedidoService.create(pedidoData);
      toast.success('Pedido creado exitosamente!');
      
      // Actualizar estado de mesa a "ocupada"
      await mesaService.updateEstado(pedidoData.mesaId, 'ocupada');
      
      // Recargar mesas para reflejar cambio
      cargarMesas();
      
      // Redirigir a página de pedidos
      setTimeout(() => {
        window.location.href = '/pedidos';
      }, 1500);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creando pedido:', error);
      
      const mensajeError = error.response?.data?.message || 
                          error.message || 
                          'Error al crear el pedido';
      
      toast.error(mensajeError);
      throw error;
    }
  };

  // Cambiar estado de mesa
  const handleCambiarEstado = async (mesaId, nuevoEstado) => {
    try {
      await mesaService.updateEstado(mesaId, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      
      // Actualizar lista
      setMesas(prev => prev.map(mesa =>
        mesa.id === mesaId ? { ...mesa, estado: nuevoEstado } : mesa
      ));
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  // Crear nueva mesa
  const handleCrearMesa = async (numeroMesa) => {
    try {
      const nuevaMesa = { numero: parseInt(numeroMesa), estado: 'libre' };
      const response = await mesaService.create(nuevaMesa);
      
      toast.success('Mesa creada correctamente');
      setMesas(prev => [...prev, response.data]);
      setModalCrearMesa(false);
    } catch (error) {
      console.error('Error creando mesa:', error);
      toast.error(error.response?.data || 'Error al crear la mesa');
    }
  };

  // Seleccionar mesa para pedido
  const handleSeleccionarMesa = (mesa) => {
    if (mesa.estado === 'libre') {
      setModalCrearPedido(mesa);
    } else {
      toast.info(`La mesa #${mesa.numero} está ocupada`);
    }
  };

  console.log('🎨 RENDERIZANDO COMPONENTE:', { 
    loading, 
    mesasCount: mesas.length,
    shouldShowLoading: loading 
  });

  if (loading) {
    console.log('🔄 MOSTRANDO PANTALLA DE LOADING...');
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando mesas...</p>
          <p className="text-sm text-gray-500 mt-2">
            Preparando la disposición del restaurante
          </p>
          
          {/* Info de debug */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
            <p className="text-sm font-bold text-blue-800">Estado actual:</p>
            <p className="text-xs text-blue-700 mt-1">
              • Mesas recibidas: {mesas.length}<br/>
              • Filtradas: {filteredMesas.length}<br/>
              • Loading activo: {loading.toString()}
            </p>
            <button 
              onClick={() => setLoading(false)}
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
            >
              Forzar salida de Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ MOSTRANDO MESAS NORMALES');

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Mesas</h1>
          <p className="text-gray-600 mt-2">
            Administra las mesas del restaurante y su disponibilidad
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={cargarMesas}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <FiRefreshCw />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={() => setModalCrearMesa(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            <FiPlus />
            <span>Nueva Mesa</span>
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por número
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: 1, 2, 3..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('todas')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'todas'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('libre')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'libre'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Libres
              </button>
              <button
                onClick={() => setFilter('ocupada')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'ocupada'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ocupadas
              </button>
              <button
                onClick={() => setFilter('limpieza')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'limpieza'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Limpieza
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-600">Total Mesas</p>
          <p className="text-2xl font-bold">{mesas.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-600">Mesas Libres</p>
          <p className="text-2xl font-bold text-green-600">
            {mesas.filter(m => m.estado === 'libre').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-600">Mesas Ocupadas</p>
          <p className="text-2xl font-bold text-red-600">
            {mesas.filter(m => m.estado === 'ocupada').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-600">En Limpieza</p>
          <p className="text-2xl font-bold text-yellow-600">
            {mesas.filter(m => m.estado === 'limpieza').length}
          </p>
        </div>
      </div>

      {/* Lista de mesas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Mesas ({filteredMesas.length})
          </h2>
          <div className="text-sm text-gray-600">
            Mostrando {filteredMesas.length} de {mesas.length} mesas
          </div>
        </div>

        {filteredMesas.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron mesas
            </h3>
            <p className="text-gray-600 mb-4">
              {search || filter !== 'todas'
                ? 'Intenta con otros filtros de búsqueda'
                : 'No hay mesas registradas en el sistema'}
            </p>
            {!search && filter === 'todas' && (
              <button
                onClick={() => setModalCrearMesa(true)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                Crear Primera Mesa
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMesas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                onSelectMesa={handleSeleccionarMesa}
                onCambiarEstado={() => setModalCambiarEstado(mesa)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal cambiar estado */}
      {modalCambiarEstado && (
        <CambiarEstadoModal
          mesa={modalCambiarEstado}
          onClose={() => setModalCambiarEstado(null)}
          onConfirm={handleCambiarEstado}
        />
      )}

      {/* Modal crear mesa */}
      {modalCrearMesa && (
        <CrearMesaModal
          onClose={() => setModalCrearMesa(false)}
          onConfirm={handleCrearMesa}
        />
      )}
      
      {modalCrearPedido && (
        <CrearPedidoModal
          mesa={modalCrearPedido}
          onClose={() => setModalCrearPedido(null)}
          onCreate={handleCrearPedido}
        />
      )}
    </div>
  );
};

export default Mesas;