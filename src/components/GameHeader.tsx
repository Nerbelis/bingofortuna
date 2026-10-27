import React from 'react';
import { Wallet, HelpCircle, Shield, Coins, Sparkles } from 'lucide-react';
import { UserWallet } from '../types/bingo';

interface GameHeaderProps {
  wallet: UserWallet;
  onOpenCashier: () => void;
  onOpenRules: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  wallet,
  onOpenCashier,
  onOpenRules,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black font-display text-amber-400 text-lg">
              B
            </div>
          </div>
          <span className="font-display font-black text-xl tracking-tight text-white whitespace-nowrap">
            Bingo <span className="text-amber-400">Fortuna</span>
          </span>
        </div>

        {/* Zone 2: Concise Nav Links (Single line, text only, no capsule pills) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={onOpenRules}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Cómo Jugar
          </button>
          <a
            href="#tombola-section"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Tómbola Automatizada
          </a>
          <a
            href="#cards-section"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Mis Cartones
          </a>
          <button
            onClick={onOpenCashier}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Binance & Pago Móvil
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Wallet / Cashier Button) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCashier}
            className="group px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 text-xs"
          >
            <Wallet className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
            <span className="font-mono tabular-nums text-sm">
              ${wallet.balanceUsdt.toFixed(2)}
            </span>
            <span className="text-[10px] uppercase font-bold opacity-80">Cajero</span>
          </button>
        </div>
      </div>
    </header>
  );
};
