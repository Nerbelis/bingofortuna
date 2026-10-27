import React from 'react';
import {
  Trophy,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Shuffle,
  Star,
  Check,
  AlertCircle,
} from 'lucide-react';
import { BingoCard, BingoLetter, GamePhase } from '../types/bingo';
import { LETTER_COLORS, LETTERS } from '../utils/bingoLogic';
import { sounds } from '../utils/audio';

interface BingoCardsGridProps {
  cards: BingoCard[];
  calledNumbersSet: Set<number>;
  autoDaub: boolean;
  onToggleCell: (cardId: string, row: number, col: number) => void;
  onClaimWin: (cardId: string) => void;
  onShuffleCards: () => void;
  phase: GamePhase;
  daubColor: string;
}

export const BingoCardsGrid: React.FC<BingoCardsGridProps> = ({
  cards,
  calledNumbersSet,
  autoDaub,
  onToggleCell,
  onClaimWin,
  onShuffleCards,
  phase,
  daubColor,
}) => {
  const getDaubBgClass = () => {
    switch (daubColor) {
      case 'red':
        return 'bg-rose-500 text-white shadow-rose-900/50';
      case 'emerald':
        return 'bg-emerald-500 text-white shadow-emerald-900/50';
      case 'cyan':
        return 'bg-cyan-500 text-slate-950 shadow-cyan-900/50';
      default:
        return 'bg-amber-400 text-slate-950 shadow-amber-900/50';
    }
  };

  const handleCellClick = (cardId: string, row: number, col: number, num: number, isFree?: boolean) => {
    if (isFree) return;
    if (phase !== 'CALLING') return;

    // Check if the number has been drawn
    if (calledNumbersSet.has(num)) {
      sounds.playDaub();
      onToggleCell(cardId, row, col);
    } else {
      // Gentle feedback that this number has not been called yet
      sounds.playDaub(); // subtle feedback click
    }
  };

  if (cards.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No tienes cartones activos</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Adquiere cartones para la próxima partida automatizada. Puedes jugar con hasta 4 cartones a la vez.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards bar controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tus Cartones en Juego ({cards.length})
          </span>
          {phase === 'LOBBY' && (
            <button
              onClick={onShuffleCards}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline ml-2"
            >
              <Shuffle className="w-3.5 h-3.5" /> Cambiar números
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="hidden sm:inline">Modo:</span>
          <span className={`font-semibold ${autoDaub ? 'text-emerald-400' : 'text-amber-400'}`}>
            {autoDaub ? 'Marcado Automático ON' : 'Marcado Manual'}
          </span>
        </div>
      </div>

      {/* Grid of Cartones */}
      <div
        className={`grid gap-4 ${
          cards.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : cards.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2'
        }`}
      >
        {cards.map((card, cardIndex) => {
          const canClaim = card.hasWonBingo || card.hasWonLine || card.hasWonCorners;

          return (
            <div
              key={card.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl transition-all relative flex flex-col ${
                card.hasWonBingo
                  ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-amber-500/20'
                  : card.hasWonLine
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">Cartón #{cardIndex + 1}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{card.serialNumber}</span>
                </div>

                {/* Progress distance indicators */}
                <div className="flex items-center gap-2">
                  {card.hasWonBingo ? (
                    <span className="text-[11px] font-black text-amber-300 animate-pulse bg-amber-500/20 px-2 py-0.5 rounded">
                      ¡BINGO COMPLETO!
                    </span>
                  ) : card.hasWonLine ? (
                    <span className="text-[11px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                      ¡LÍNEA!
                    </span>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {card.distanceToLine === 1 ? (
                        <span className="text-amber-400 font-bold animate-pulse">¡A 1 para Línea!</span>
                      ) : (
                        <span>Falta {card.distanceToLine} para línea</span>
                      )}
                      <span className="mx-1 text-slate-600">·</span>
                      <span className="text-slate-500 font-mono">B:{card.distanceToBingo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* B-I-N-G-O Columns Header */}
              <div className="grid grid-cols-5 bg-slate-950/70 border-b border-slate-800 text-center font-display font-black text-sm sm:text-base py-1">
                {LETTERS.map((letter) => (
                  <div key={letter} className={`${LETTER_COLORS[letter].text}`}>
                    {letter}
                  </div>
                ))}
              </div>

              {/* 5x5 Grid Cells */}
              <div className="p-2 sm:p-2.5 bg-gradient-to-b from-slate-900 to-slate-950 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 aspect-square">
                  {card.grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const isDrawn = calledNumbersSet.has(cell.number);
                      const isFree = cell.isFree;
                      const isMarked = cell.marked;

                      return (
                        <button
                          key={`${card.id}-${rIdx}-${cIdx}`}
                          type="button"
                          disabled={isFree || (autoDaub && phase === 'CALLING')}
                          onClick={() => handleCellClick(card.id, rIdx, cIdx, cell.number, isFree)}
                          className={`relative rounded-xl font-display font-bold text-sm sm:text-lg flex flex-col items-center justify-center select-none transition-all duration-150 cursor-pointer ${
                            isFree
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-400/30'
                              : isMarked
                              ? `${getDaubBgClass()} font-black shadow-md scale-95`
                              : isDrawn && !isMarked
                              ? 'bg-amber-400/20 text-amber-200 border border-amber-400/60 animate-pulse'
                              : 'bg-slate-800/90 hover:bg-slate-750 text-slate-100 border border-slate-700/60 hover:border-slate-500'
                          }`}
                        >
                          {isFree ? (
                            <div className="flex flex-col items-center justify-center">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">LIBRE</span>
                            </div>
                          ) : (
                            <>
                              <span className="tabular-nums font-mono">{cell.number}</span>
                              {isMarked && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                  <div className="w-7 h-7 rounded-full border-2 border-white" />
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card Footer: Claim Bingo Button if eligible */}
              {canClaim && (
                <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-center">
                  <button
                    onClick={() => onClaimWin(card.id)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/40 flex items-center justify-center gap-2 animate-bounce cursor-pointer transition-all"
                  >
                    <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
                    ¡CANTAR {card.hasWonBingo ? 'BINGO' : 'LÍNEA'} AHORA!
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
