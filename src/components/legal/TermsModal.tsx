import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
          Términos y Condiciones de Uso
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-gray-300">
          <p className="text-xs text-gray-400">Última actualización: Octubre de 2026</p>
          <p>
            Bienvenido/a a <strong>Bingo Fortuna</strong>. Al acceder, registrarse o participar en las salas de bingo y sorteos en línea a través de esta plataforma web, el usuario acepta de manera plena e incondicional los presentes Términos y Condiciones.
          </p>
          <h3 className="text-base font-semibold text-amber-300">1. Requisito de Mayoría de Edad (+18)</h3>
          <p>
            El acceso y uso de esta plataforma está restringido estrictamente a personas mayores de 18 años. La plataforma se reserva el derecho de solicitar verificación de identidad o comprobación de edad en cualquier momento.
          </p>
          <h3 className="text-base font-semibold text-amber-300">2. Naturaleza del Servicio</h3>
          <p>
            Bingo Fortuna es una plataforma de entretenimiento basada en un sistema automatizado de extracción de balotas (RNG). La adquisición de cartones es definitiva y las decisiones del sistema automatizado sobre los cartones ganadores son inapelables.
          </p>
          <h3 className="text-base font-semibold text-amber-300">3. Transacciones y Registro</h3>
          <p>
            Las recargas, compras de cartones o cobros gestionados por medios digitales (Pago Móvil, Binance Pay, USDT) están sujetos a verificación de comprobante.
          </p>
          <h3 className="text-base font-semibold text-amber-300">4. Prohibición de Mal Uso</h3>
          <p>
            Queda prohibido el uso de bots, scripts o modificación del código cliente. Cualquier intento de manipulación conllevará la cancelación de la cuenta y los saldos asociados.
          </p>
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};