import React, { useRef, useState, useEffect } from 'react';
import { FiPrinter, FiX, FiShoppingBag } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';

const BoucherTicket = ({ pedido, onClose }) => {
  const contentRef = useRef();
  const [config, setConfig] = useState({
    nombre: 'MI RESTAURANTE',
    direccion: 'Av. Principal 123',
    telefono: '+51 123 456 789',
    ruc: '20123456781',
    mensaje: 'Gracias por su visita',
    sistema: 'Sistema POS Restaurante v1.0'
  });

  // Cargar configuración del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('restaurant_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          nombre: parsed.nombreRestaurante || 'MI RESTAURANTE',
          direccion: parsed.direccion || 'Av. Principal 123',
          telefono: parsed.telefono || '+51 123 456 789',
          ruc: '20123456781',
          mensaje: 'Gracias por su visita',
          sistema: 'Sistema POS Restaurante v1.0'
        });
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    }
  }, []);

  // CORRECCIÓN: Usar useReactToPrint CORRECTAMENTE
  const handlePrint = useReactToPrint({
    contentRef: contentRef, // ← ESTO ES LO IMPORTANTE
    documentTitle: `Boucher_${pedido.id}_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => toast.success('Boleta enviada a impresión'),
    onPrintError: (error) => {
      console.error('Error al imprimir:', error);
      toast.error('Error al imprimir la boleta');
    }
  });

  // Calcular totales
  const calcularTotales = () => {
    let subtotal = 0;
    const items = pedido.detalles || [];
    
    items.forEach(detalle => {
      subtotal += detalle.cantidad * detalle.precioUnitario;
      if (detalle.extras) {
        detalle.extras.forEach(extra => {
          subtotal += extra.precio || 0;
        });
      }
    });
    
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  };

  const { subtotal, igv, total } = calcularTotales();

  // Formatear fecha para boleta
  const fechaHora = new Date(pedido.creadoEn).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold flex items-center">
            <FiShoppingBag className="mr-2" />
            Boucher de Venta
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Contenido para imprimir - AQUÍ el ref debe apuntar SOLO al contenido */}
        <div className="p-4">
          {/* ESTE es el div que se imprimirá */}
          <div ref={contentRef} className="print-content">
            {/* Encabezado del boucher */}
            <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
              <h1 className="text-xl font-bold tracking-wider uppercase">
                {config.nombre}
              </h1>
              <p className="text-xs">{config.direccion}</p>
              <p className="text-xs">Telf: {config.telefono}</p>
              <p className="text-xs">RUC: {config.ruc}</p>
              <p className="text-xs mt-1">--------------------------------</p>
            </div>

            {/* Información del pedido */}
            <div className="mb-3">
              <div className="flex justify-between">
                <span>BOUCHER N°:</span>
                <span className="font-bold">{String(pedido.id).padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span>MESA:</span>
                <span className="font-bold">{pedido.mesaId}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{fechaHora.split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>HORA:</span>
                <span>{fechaHora.split(',')[1]}</span>
              </div>
              <div className="flex justify-between">
                <span>ATENDIDO POR:</span>
                <span>MOZO 01</span>
              </div>
              <div className="border-t border-dashed border-gray-400 my-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span>ESTADO:</span>
                  <span className="uppercase">{pedido.estadoGeneral}</span>
                </div>
              </div>
            </div>

            {/* Items - Estilo tabla simple */}
            <div className="border-t border-dashed border-gray-400 pt-2 mb-3">
              <div className="text-center font-bold mb-1">DETALLE DE CONSUMO</div>
              <div className="border-b border-gray-300 pb-1 mb-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="w-12 text-center">CANT</span>
                  <span className="flex-1">DESCRIPCIÓN</span>
                  <span className="w-16 text-right">IMPORTE</span>
                </div>
              </div>

              {pedido.detalles?.map((detalle, idx) => (
                <div key={idx} className="mb-1">
                  <div className="flex justify-between">
                    <span className="w-12 text-center">{detalle.cantidad}</span>
                    <span className="flex-1 truncate">{detalle.itemNombre}</span>
                    <span className="w-16 text-right">
                      S/ {(detalle.cantidad * detalle.precioUnitario).toFixed(2)}
                    </span>
                  </div>
                  
                  {detalle.extras?.map((extra, idx2) => (
                    <div key={idx2} className="flex justify-between text-xs pl-4">
                      <span className="w-12 text-center">+1</span>
                      <span className="flex-1">Extra: {extra.nombre}</span>
                      <span className="w-16 text-right">
                        S/ {extra.precio?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  {detalle.observaciones && (
                    <div className="text-xs pl-4 italic">
                      Obs: {detalle.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="border-t border-dashed border-gray-400 pt-2">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>I.G.V. (18%):</span>
                <span>S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-400 pt-1 mt-1">
                <span>TOTAL:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pie del boucher */}
            <div className="text-center border-t border-dashed border-gray-400 pt-3 mt-3">
              <p className="text-xs font-bold">*** {config.mensaje} ***</p>
              <p className="text-xs mt-1">Conserve este boucher</p>
              <p className="text-xs">como comprobante de pago</p>
              <p className="text-xs mt-2">--------------------------------</p>
              <p className="text-[10px]">{config.sistema}</p>
              <p className="text-[10px]">{new Date().toLocaleString('es-PE')}</p>
            </div>
          </div>

          {/* Botones de acción - Esto NO se imprimirá */}
          <div className="flex justify-between mt-6 pt-4 border-t print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Cerrar Vista
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FiPrinter className="mr-2" />
              Imprimir Boleta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ESTILOS CSS para la impresión
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-content, .print-content * {
      visibility: visible;
    }
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    .print-content h1 {
      font-size: 14px;
    }
    .print-content .border-dashed {
      border-style: dashed !important;
    }
  }
`;

// Agregar estilos al documento
const styleSheet = document.createElement("style");
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

export default BoucherTicket;