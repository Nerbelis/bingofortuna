import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Coins, ArrowRight, Wallet, Check } from 'lucide-react';
import { WinningAnnouncement } from '../types/bingo';

interface WinnerModalProps {
  announcement: WinningAnnouncement | null;
  onClose: () => void;
  onOpenCashier: () => void;
  onNextRound: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  announcement,
  onClose,
  onOpenCashier,
  onNextRound,
}) => {
  useEffect(() => {
    if (announcement?.isUser) {
      // Fire confetti bursts!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#10B981', '#F43F5E', '#38BDF8'],
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 350);

        return () => clearTimeout(timer);
      } catch {}
    }
  }, [announcement]);

  if (!announcement) return null;

  const isUser = announcement.isUser;
  const patternTitle =
    announcement.pattern === 'BINGO'
      ? '¡GRAN BOTE BINGO!'
      : announcement.pattern === 'LINEA'
      ? '¡LÍNEA GANADORA!'
      : '¡4 ESQUINAS!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-amber-400">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Pattern & Winner Title */}
        <span className="text-xs font-black uppercase tracking-widest text-amber-400">
          {patternTitle}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
          {isUser ? '¡Felicidades, Has Ganado!' : `Ganador: ${announcement.playerName}`}
        </h2>

        {/* Prize amount */}
        <div className="my-5 p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Premio Acreditado</span>
          <div className="text-3xl sm:text-4xl font-black font-display text-emerald-400 tabular-nums">
            +${announcement.prizeAmountUsdt.toFixed(2)}{' '}
            <span className="text-sm font-sans text-amber-400 font-bold">USDT</span>
          </div>
          <span className="text-sm font-semibold text-slate-400 mt-1 block tabular-nums">
            ≈ {announcement.prizeAmountVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            Cartón: {announcement.cardSerial}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {isUser && (
            <button
              onClick={() => {
                onClose();
                onOpenCashier();
              }}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Wallet className="w-4 h-4 text-amber-400" /> Cobrar Ganancias (Binance / Pago Móvil)
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onNextRound();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <span>Jugar Nueva Partida</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
