import React, { useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Zap,
  Clock,
  Radio,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { BingoBall, BingoLetter, GameSpeed, GamePhase } from '../types/bingo';
import { LETTER_COLORS, LETTERS, LETTER_RANGES } from '../utils/bingoLogic';

interface TombolaCallerProps {
  currentBall: BingoBall | null;
  recentBalls: BingoBall[];
  calledNumbersSet: Set<number>;
  phase: GamePhase;
  speed: GameSpeed;
  onChangeSpeed: (spd: GameSpeed) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isSpinning: boolean;
}

export const TombolaCaller: React.FC<TombolaCallerProps> = ({
  currentBall,
  recentBalls,
  calledNumbersSet,
  phase,
  speed,
  onChangeSpeed,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  isSpinning,
}) => {
  const currentColors = currentBall ? LETTER_COLORS[currentBall.letter] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Top Header / Audio & Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Bolillero Automatizado</span>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {calledNumbersSet.size} / 75 balotas
          </span>
        </div>

        {/* Action controls: Speed + Audio */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onChangeSpeed('SLOW')}
              title="Lento (5.0s por balota)"
              className={`px-2 py-1 rounded font-medium transition-all ${
                speed === 'SLOW' ? 'bg-slate-800 text-amber-300 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              5s
            </button>
            <button
              onClick={() => onChangeSpeed('NORMAL')}
              title="Normal (3.5s por balota)"
              className={`px-2 py-1 rounded font-medium transition-all ${
                speed === 'NORMAL' ? 'bg-slate-800 text-amber-300 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              3.5s
            </button>
            <button
              onClick={() => onChangeSpeed('FAST')}
              title="Turbo (2.0s por balota)"
              className={`px-2 py-1 rounded font-medium transition-all ${
                speed === 'FAST' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 inline" /> 2s
            </button>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar Efectos de Sonido' : 'Activar Sonido'}
            className={`p-1.5 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Voice Announcer Toggle */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Locutor en español activado' : 'Activar Locutor por voz'}
            className={`p-1.5 rounded-lg border transition-all ${
              voiceEnabled
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Showcase: Animated 3D Cage & Prominent Ball Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Animated Tombola Sphere / Cage Visual */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
          {/* Subtle spinning cage background effect */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            {/* Spinning decorative ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 transition-transform ${
                isSpinning ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4s' }}
            />
            <div
              className={`absolute inset-2 rounded-full border border-yellow-400/20 transition-transform ${
                isSpinning ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s', animationDirection: 'reverse' }}
            />

            {/* Glowing inner drum */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-500/20 via-slate-900 to-black border-2 border-amber-500/40 shadow-inner flex flex-col items-center justify-center p-2 text-center">
              {isSpinning && (
                <div className="text-[11px] font-semibold text-amber-300 animate-pulse uppercase tracking-wider">
                  Girando...
                </div>
              )}
              {!isSpinning && phase === 'CALLING' && currentBall && (
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cantando
                </div>
              )}
              {phase === 'COUNTDOWN' && (
                <div className="text-center">
                  <span className="text-[10px] text-amber-400 block font-bold">PREPARANDO</span>
                  <span className="text-xs text-slate-300">Bolillero</span>
                </div>
              )}
              {phase === 'LOBBY' && (
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-300">SALA ABIERTA</span>
                  <span className="text-[10px] text-slate-400 block">Comprar cartones</span>
                </div>
              )}
            </div>

            {/* Floating particles or decorative spheres */}
            <div className="absolute top-2 right-4 w-4 h-4 rounded-full bg-rose-500/80 shadow-md animate-bounce" />
            <div className="absolute bottom-3 left-4 w-4 h-4 rounded-full bg-sky-500/80 shadow-md animate-pulse" />
            <div className="absolute top-8 left-2 w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-md" />
          </div>

          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            Tómbola Neumática Digital 75
          </span>
        </div>

        {/* HUGE CURRENT BALL DISPLAY */}
        <div className="md:col-span-7 flex flex-col items-center justify-center text-center p-4 bg-slate-950/70 border border-slate-800 rounded-xl relative min-h-[160px]">
          {currentBall ? (
            <div className="flex flex-col items-center">
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform scale-100 ring-4 ${
                  currentColors?.bg || 'bg-amber-500'
                } ${currentColors?.ring || 'ring-amber-300'}`}
                style={{
                  boxShadow: '0 0 35px rgba(234, 179, 8, 0.35), inset 0 2px 10px rgba(255, 255, 255, 0.4)',
                }}
              >
                <span className="text-2xl sm:text-3xl font-black font-display tracking-widest text-white/90 leading-none">
                  {currentBall.letter}
                </span>
                <span className="text-4xl sm:text-5xl font-black font-display text-white tabular-nums leading-none mt-1">
                  {currentBall.number}
                </span>
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-300">
                Balota extraída: <span className="text-amber-400 font-bold">{currentBall.letter}-{currentBall.number}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-500">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-2">
                <span className="text-xl font-bold font-display text-slate-600">75</span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                {phase === 'COUNTDOWN'
                  ? 'Iniciando sorteo de balotas...'
                  : phase === 'LOBBY'
                  ? 'Compra tus cartones para iniciar'
                  : 'Listo para cantar'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Balls Carousel */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Últimas Balotas Cantadas
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {recentBalls.length === 0 ? (
            <div className="text-xs text-slate-500 py-1 italic">
              Aún no se han extraído balotas en esta partida
            </div>
          ) : (
            recentBalls.slice(0, 8).map((ball, idx) => {
              const colors = LETTER_COLORS[ball.letter];
              return (
                <div
                  key={`${ball.letter}-${ball.number}-${idx}`}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm ${
                    idx === 0
                      ? 'border-amber-400 bg-amber-500/20 text-white font-bold ring-2 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      colors.bg
                    } text-white`}
                  >
                    {ball.letter}
                  </span>
                  <span className="font-mono text-xs font-bold tabular-nums">
                    {ball.number}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* TABLERO MAESTRO 1 - 75 (MASTER BOARD) */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Tablero Maestro (1 - 75)
          </span>
          <span className="text-[11px] text-slate-500">
            {calledNumbersSet.size} cantadas / {75 - calledNumbersSet.size} restantes
          </span>
        </div>

        <div className="space-y-1.5">
          {LETTERS.map((letter) => {
            const [min, max] = LETTER_RANGES[letter];
            const colors = LETTER_COLORS[letter];
            const numbers = [];
            for (let i = min; i <= max; i++) numbers.push(i);

            return (
              <div key={letter} className="flex items-center gap-1.5 text-xs">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                    colors.bg
                  } text-white font-display`}
                >
                  {letter}
                </span>
                <div className="grid grid-cols-15 gap-1 flex-1">
                  {numbers.map((num) => {
                    const isCalled = calledNumbersSet.has(num);
                    const isCurrent = currentBall?.number === num;
                    return (
                      <div
                        key={num}
                        className={`h-6 rounded flex items-center justify-center text-[10px] font-mono tabular-nums font-semibold transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-110 z-10 font-black'
                            : isCalled
                            ? `${colors.bg} text-white shadow-sm`
                            : 'bg-slate-900/80 text-slate-600 hover:text-slate-400'
                        }`}
                        title={`${letter}-${num}`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
