import React from 'react';
import { X, HelpCircle, Trophy, Smartphone, Coins, ShieldCheck, Check } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">
              Reglas del Bingo & Métodos de Pago
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Rules Section */}
          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> 1. Dinámica del Bingo 75 Balotas
            </h4>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <p>
                Cada cartón cuenta con una cuadrícula de 5x5 con 24 números aleatorios y un centro{' '}
                <strong className="text-amber-300">LIBRE</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li><strong className="text-rose-400">B</strong>: Números del 1 al 15</li>
                <li><strong className="text-amber-400">I</strong>: Números del 16 al 30</li>
                <li><strong className="text-emerald-400">N</strong>: Números del 31 al 45 (Centro Libre)</li>
                <li><strong className="text-sky-400">G</strong>: Números del 46 al 60</li>
                <li><strong className="text-purple-400">O</strong>: Números del 61 al 75</li>
              </ul>
              <p className="pt-1">
                Puedes activar el <strong>Marcado Automático</strong> para que las balotas se sellen solas o jugar en modo manual tocando las casillas.
              </p>
            </div>
          </div>

          {/* Winning Patterns */}
          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2">
              2. Premios y Patrones Ganadores
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="font-bold text-emerald-400 block mb-0.5">Línea (20%)</span>
                <p className="text-[11px] text-slate-400">5 casillas en fila, columna o diagonal continua.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="font-bold text-sky-400 block mb-0.5">4 Esquinas (15%)</span>
                <p className="text-[11px] text-slate-400">Marcar las 4 esquinas extremas del cartón.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-center">
                <span className="font-bold text-amber-300 block mb-0.5">Cartón Lleno (65%)</span>
                <p className="text-[11px] text-slate-400">Completar todas las 24 casillas numeradas.</p>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 3. Pagos Automatizados (Binance & Pago Móvil)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Coins className="w-4 h-4" /> Binance Pay (USDT)
                </div>
                <p className="text-slate-400">
                  Recargas y retiros instantáneos mediante Pay ID oficial o USDT (BEP-20 / TRC-20) sin comisión adicional.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Smartphone className="w-4 h-4" /> Pago Móvil (Venezuela)
                </div>
                <p className="text-slate-400">
                  Acepta Banesco, Banco de Venezuela, Mercantil, BBVA, Bancamiga y más con tasa de cambio oficial en vivo. Acreditación automática al reportar referencia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Entendido, ¡A Jugar!
          </button>
        </div>
      </div>
    </div>
  );
};
