import React from 'react';
import {
  Trophy,
  Flame,
  Award,
  Clock,
  Sparkles,
  Play,
  ShoppingCart,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { GamePhase, UserWallet } from '../types/bingo';

interface JackpotHudProps {
  phase: GamePhase;
  countdown: number;
  jackpotUsdt: number;
  exchangeRate: number;
  cardsCount: number;
  onBuyCards: (count: number) => void;
  onStartGameNow: () => void;
  autoDaub: boolean;
  onToggleAutoDaub: () => void;
  cardPriceUsdt: number;
  wallet: UserWallet;
  onOpenCashier: () => void;
}

export const JackpotHud: React.FC<JackpotHudProps> = ({
  phase,
  countdown,
  jackpotUsdt,
  exchangeRate,
  cardsCount,
  onBuyCards,
  onStartGameNow,
  autoDaub,
  onToggleAutoDaub,
  cardPriceUsdt,
  wallet,
  onOpenCashier,
}) => {
  const jackpotVes = jackpotUsdt * exchangeRate;
  const prizeFullBingo = jackpotUsdt * 0.65;
  const prizeLine = jackpotUsdt * 0.2;
  const prizeCorners = jackpotUsdt * 0.15;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Top Banner: Jackpot Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Pozo Acumulado de la Sala
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded font-sans">
                EN VIVO
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-display text-white tabular-nums">
                ${jackpotUsdt.toFixed(2)}{' '}
                <span className="text-sm font-sans text-amber-400">USDT</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-400 tabular-nums">
                ≈ {jackpotVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
              </span>
            </div>
          </div>
        </div>

        {/* Phase / Countdown state */}
        <div className="flex items-center gap-3">
          {phase === 'COUNTDOWN' && (
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-amber-500/40">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Iniciando en</span>
                <span className="text-lg font-black text-amber-300 font-mono tabular-nums leading-none">
                  {countdown}s
                </span>
              </div>
            </div>
          )}

          {phase === 'CALLING' && (
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-emerald-500/40">
              <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Estado</span>
                <span className="text-sm font-bold text-emerald-400 leading-none">Partida en Curso</span>
              </div>
            </div>
          )}

          {phase === 'LOBBY' && (
            <button
              onClick={onStartGameNow}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Comenzar Sorteo Ahora
            </button>
          )}
        </div>
      </div>

      {/* Prize Breakdown (Línea, 4 Esquinas, Cartón Lleno) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Línea (20%)</span>
          <span className="text-sm sm:text-base font-black font-display text-emerald-400 tabular-nums">
            ${prizeLine.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
          </span>
          <span className="text-[10px] text-slate-500 block">
            {(prizeLine * exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs
          </span>
        </div>

        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">4 Esquinas (15%)</span>
          <span className="text-sm sm:text-base font-black font-display text-sky-400 tabular-nums">
            ${prizeCorners.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
          </span>
          <span className="text-[10px] text-slate-500 block">
            {(prizeCorners * exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs
          </span>
        </div>

        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-amber-400 block">Cartón Lleno (65%)</span>
          <span className="text-sm sm:text-base font-black font-display text-amber-300 tabular-nums">
            ${prizeFullBingo.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">USDT</span>
          </span>
          <span className="text-[10px] text-amber-200/70 block">
            {(prizeFullBingo * exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs
          </span>
        </div>
      </div>

      {/* Cartón Purchase & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Comprar Cartones:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((count) => {
              const cost = count * cardPriceUsdt;
              const hasBalance = wallet.balanceUsdt >= cost;

              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    if (!hasBalance) {
                      onOpenCashier();
                    } else {
                      onBuyCards(count);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    cardsCount === count
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{count}</span>
                  <span className="text-[10px] text-slate-400 font-mono">(${cost})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-Daub switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoDaub}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoDaub
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                autoDaub ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'
              }`}
            >
              {autoDaub && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span>Marcado Automático</span>
          </button>
        </div>
      </div>
    </div>
  );
};
