import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
          Política de Privacidad
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-300">
          <p className="text-xs text-gray-400">Última actualización: Octubre de 2026</p>
          <p>
            En <strong>Bingo Fortuna</strong> nos tomamos muy en serio la seguridad y privacidad de nuestros usuarios.
          </p>
          <h3 className="text-base font-semibold text-amber-300">1. Datos Recopilados</h3>
          <p>
            Podemos solicitar datos básicos como nombre de usuario, número de contacto (para validación de Pago Móvil/Telegram) y registros de transacción para la acreditación de premios.
          </p>
          <h3 className="text-base font-semibold text-amber-300">2. Uso de la Información</h3>
          <p>
            La información recogida se usa únicamente para procesar las compras de cartones, verificar los pagos y garantizar la transparencia del juego.
          </p>
          <h3 className="text-base font-semibold text-amber-300">3. Protección y Confidencialidad</h3>
          <p>
            No vendemos ni compartimos información personal con terceros. Todas las comunicaciones cliente-servidor viajan cifradas con SSL/TLS mediante Cloudflare.
          </p>
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};