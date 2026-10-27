import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsibleGamingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border border-amber-500/30 rounded-xl p-6 text-gray-200 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-amber-500/20 pb-2">
          Juego Responsable y Descargo de Responsabilidad
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-300">
          <h3 className="text-base font-semibold text-amber-300">1. Exención de Responsabilidad Técnica</h3>
          <p>
            Bingo Fortuna no se responsabiliza por interrupciones en la jugada derivadas de desconexiones de red, cortes de luz locales o fallos en el dispositivo del usuario.
          </p>
          <h3 className="text-base font-semibold text-amber-300">2. Juego Moderado</h3>
          <p>
            Promovemos el entretenimiento sano. Se recomienda participar utilizando exclusivamente presupuestos destinados al ocio personal. El bingo es un juego de azar, no una vía de inversión ni fuente de ingresos garantizada.
          </p>
          <h3 className="text-base font-semibold text-amber-300">3. Control del Participante</h3>
          <p>
            Le sugerimos establecer límites de tiempo y dinero antes de ingresar a las salas de sorteo en vivo.
          </p>
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};