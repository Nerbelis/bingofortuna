/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import { Footer } from './components/Footer';
import { getActiveExchangeRate } from './utils/currencyService';
import {
  BingoCard,
  GamePhase,
  GameSpeed,
  BingoBall,
  Transaction,
  UserWallet,
  WinningAnnouncement,
  ChatMessage,
  VirtualPlayer
} from './types/bingo';
import {
  generateTombolaDeck,
  generateBingoCard,
  evaluateCard,
  INITIAL_VIRTUAL_PLAYERS,
  CHAT_CAN_SAY
} from './utils/bingoLogic';
import { sounds } from './utils/audio';
import { GameHeader } from './components/GameHeader';
import { JackpotHud } from './components/JackpotHud';
import { TombolaCaller } from './components/TombolaCaller';
import { BingoCardsGrid } from './components/BingoCardsGrid';
import { LiveRoomChat } from './components/LiveRoomChat';
import { CashierModal } from './components/CashierModal';
import { WinnerModal } from './components/WinnerModal';
import { RulesModal } from './components/RulesModal';
import {
  HelpCircle,
  Shield,
  Smartphone,
  Coins,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function App() {
  // --- CONSTANTES DEL JUEGO ---
  const CARD_PRICE_USDT = 0.5;
  const INITIAL_EXCHANGE_RATE = 900; // Bs per USDT
  const HOUSE_FEE_PERCENTAGE = 0.15; // Tu 15% de ganancia como propietaria
  const [houseWallet, setHouseWallet] = useState<number>(0);

  // --- SISTEMA HÍBRIDO DE TASA DE CAMBIO ---
  const [tasaCambio, setTasaCambio] = useState(900);

  useEffect(() => {
    async function cargarTasa() {
      const tasaActual = await getActiveExchangeRate();
      setTasaCambio(tasaActual);
    }
    cargarTasa();

    const intervalo = setInterval(cargarTasa, 1800000);
    return () => clearInterval(intervalo);
  }, []);


  // Wallet State
  const [wallet, setWallet] = useState<UserWallet>({
    balanceUsdt: 12.0,
    balanceVes: 12.0 * INITIAL_EXCHANGE_RATE,
    exchangeRate: INITIAL_EXCHANGE_RATE,
    autoDaub: true,
    soundEnabled: true,
    voiceEnabled: false,
    daubColor: 'gold',
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-984210',
      type: 'DEPOSIT',
      amountUsdt: 15.0,
      amountVes: 15.0 * INITIAL_EXCHANGE_RATE,
      method: 'PAGOMOVIL',
      reference: '84920194',
      status: 'COMPLETED',
      description: 'Depósito Pago Móvil Banesco',
      date: '10:14 AM',
    },
    {
      id: 'TX-984211',
      type: 'BUY_CARD',
      amountUsdt: 3.0,
      amountVes: 3.0 * INITIAL_EXCHANGE_RATE,
      status: 'COMPLETED',
      description: 'Compra de 3 Cartones de Bingo',
      date: '10:20 AM',
    },
  ]);

  // Modals state
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [winnerModalData, setWinnerModalData] = useState<WinningAnnouncement | null>(null);

  // Game Engine State
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [speed, setSpeed] = useState<GameSpeed>('NORMAL');
  const [countdown, setCountdown] = useState<number>(10);
  const [jackpotUsdt, setJackpotUsdt] = useState<number>(18.0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Balls Deck & Called Numbers
  const [deck, setDeck] = useState<BingoBall[]>([]);
  const [currentBall, setCurrentBall] = useState<BingoBall | null>(null);
  const [recentBalls, setRecentBalls] = useState<BingoBall[]>([]);
  const [calledNumbersSet, setCalledNumbersSet] = useState<Set<number>>(new Set());

  // Player Cards
  const [cards, setCards] = useState<BingoCard[]>([
    generateBingoCard(1),
    generateBingoCard(2),
  ]);

  // Claimed Prizes in Current Round (to avoid duplicate payouts)
  const [lineClaimed, setLineClaimed] = useState<boolean>(false);
  const [cornersClaimed, setCornersClaimed] = useState<boolean>(false);
  const [bingoClaimed, setBingoClaimed] = useState<boolean>(false);

  // Community Chat & Players
  const [virtualPlayers, setVirtualPlayers] = useState<VirtualPlayer[]>(INITIAL_VIRTUAL_PLAYERS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c-1',
      sender: 'Sistema',
      text: '¡Bienvenidos a la Sala Virtual de Bingo Fortuna! Extracción automatizada en vivo.',
      timestamp: '10:30 AM',
      isSystem: true,
    },
    {
      id: 'c-2',
      sender: 'CryptoChamo (Valencia)',
      text: '¡Activo por aquí! Recargué por Binance Pay al instante 🚀',
      timestamp: '10:31 AM',
    },
    {
      id: 'c-3',
      sender: 'Mariana_Zulia',
      text: '¡Suerte a todos muchachos, voy con 2 cartones!',
      timestamp: '10:32 AM',
    },
  ]);

  // Timer Ref for calling balls
  const callingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound sync
  useEffect(() => {
    sounds.setMuted(!wallet.soundEnabled);
  }, [wallet.soundEnabled]);

  useEffect(() => {
    sounds.setVoiceMuted(!wallet.voiceEnabled);
  }, [wallet.voiceEnabled]);

  // Balance & Transaction Handlers
  const handleUpdateBalance = (deltaUsdt: number, deltaVes: number) => {
    setWallet((prev) => {
      const newUsdt = Math.max(0, prev.balanceUsdt + deltaUsdt);
      const newVes = newUsdt * prev.exchangeRate;
      return {
        ...prev,
        balanceUsdt: newUsdt,
        balanceVes: newVes,
      };
    });
  };

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  // Card Purchases
  const handleBuyCards = (count: number) => {
    const costUsdt = count * CARD_PRICE_USDT;
    if (wallet.balanceUsdt < costUsdt) {
      setIsCashierOpen(true);
      return;
    }

    handleUpdateBalance(-costUsdt, -costUsdt * wallet.exchangeRate);
    handleAddTransaction({
      id: `TX-${Date.now().toString().slice(-6)}`,
      type: 'BUY_CARD',
      amountUsdt: costUsdt,
      amountVes: costUsdt * wallet.exchangeRate,
      status: 'COMPLETED',
      description: `Compra de ${count} Cartón(es)`,
      date: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
    });

    // Generate fresh cards
    const newCards: BingoCard[] = [];
    for (let i = 1; i <= count; i++) {
      newCards.push(generateBingoCard(i));
    }
    setCards(newCards);

    // Increase jackpot slightly
    setJackpotUsdt((prev) => prev + costUsdt * 0.85);

    sounds.playDaub();
  };

  const handleShuffleCards = () => {
    setCards((prev) => prev.map((_, idx) => generateBingoCard(idx + 1)));
    sounds.playDaub();
  };

  // Manual Cell Toggle
  const handleToggleCell = (cardId: string, row: number, col: number) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const newGrid = card.grid.map((r, rIdx) =>
          r.map((cell, cIdx) => {
            if (rIdx === row && cIdx === col) {
              return { ...cell, marked: !cell.marked };
            }
            return cell;
          })
        );
        const updated = { ...card, grid: newGrid };
        return evaluateCard(updated, calledNumbersSet, false);
      })
    );
  };

  // Claim Winning Pattern (User action or Auto)
  const handleClaimWin = useCallback(
    (cardId: string) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;

      const evalCard = evaluateCard(card, calledNumbersSet, wallet.autoDaub);

      // Check Full House / Bingo
      if (evalCard.hasWonBingo && !bingoClaimed) {
        setBingoClaimed(true);
        const prize = jackpotUsdt * 0.65;
        const prizeVes = prize * wallet.exchangeRate;

        handleUpdateBalance(prize, prizeVes);
        handleAddTransaction({
          id: `TX-WIN-${Date.now().toString().slice(-6)}`,
          type: 'PRIZE',
          amountUsdt: prize,
          amountVes: prizeVes,
          status: 'COMPLETED',
          description: `¡PREMIO BINGO COMPLETO! Cartón ${card.serialNumber}`,
          date: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        });

        sounds.playBingoWin();
        sounds.speakAnnouncement('¡Bingo para el jugador!');

        setWinnerModalData({
          playerName: 'Tú (Jugador)',
          pattern: 'BINGO',
          prizeAmountUsdt: prize,
          prizeAmountVes: prizeVes,
          cardSerial: card.serialNumber,
          isUser: true,
          timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        });

        setPhase('WINNER_CELEBRATION');
        return;
      }

      // Check Line
      if (evalCard.hasWonLine && !lineClaimed) {
        setLineClaimed(true);
        const prize = jackpotUsdt * 0.2;
        const prizeVes = prize * wallet.exchangeRate;

        handleUpdateBalance(prize, prizeVes);
        handleAddTransaction({
          id: `TX-WIN-${Date.now().toString().slice(-6)}`,
          type: 'PRIZE',
          amountUsdt: prize,
          amountVes: prizeVes,
          status: 'COMPLETED',
          description: `Premio Línea Ganadora: Cartón ${card.serialNumber}`,
          date: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        });

        sounds.playLineWin();
        sounds.speakAnnouncement('¡Línea cantada!');

        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'Sistema',
            text: `🎉 ¡El jugador ha cantado LÍNEA ganando +$${prize.toFixed(2)} USDT!`,
            timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          },
        ]);
        return;
      }

      // Check Corners
      if (evalCard.hasWonCorners && !cornersClaimed) {
        setCornersClaimed(true);
        const prize = jackpotUsdt * 0.15;
        const prizeVes = prize * wallet.exchangeRate;

        handleUpdateBalance(prize, prizeVes);
        sounds.playLineWin();

        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'Sistema',
            text: `🌟 ¡El jugador ha cantado 4 ESQUINAS ganando +$${prize.toFixed(2)} USDT!`,
            timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          },
        ]);
      }
    },
    [cards, calledNumbersSet, wallet.autoDaub, wallet.exchangeRate, jackpotUsdt, bingoClaimed, lineClaimed, cornersClaimed]
  );

  // START GAME SEQUENCE
  const handleStartGame = () => {
    if (phase === 'CALLING') return;

    setPhase('COUNTDOWN');
    setCountdown(5);

    // Prepare fresh deck
    const freshDeck = generateTombolaDeck();
    setDeck(freshDeck);
    setRecentBalls([]);
    setCalledNumbersSet(new Set());
    setCurrentBall(null);
    setLineClaimed(false);
    setCornersClaimed(false);
    setBingoClaimed(false);

    // Reset marks on user cards
    setCards((prev) =>
      prev.map((card) => {
        const cleanGrid = card.grid.map((row) =>
          row.map((cell) => ({
            ...cell,
            marked: cell.isFree ? true : false,
          }))
        );
        return {
          ...card,
          grid: cleanGrid,
          hasWonLine: false,
          hasWonCorners: false,
          hasWonBingo: false,
          distanceToBingo: 24,
          distanceToLine: 4,
        };
      })
    );
  };

  // Countdown timer effect
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current as NodeJS.Timeout);
          setPhase('CALLING');
          sounds.playBallPop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [phase]);

  // Automated Ball Extraction Loop
  useEffect(() => {
    if (phase !== 'CALLING') {
      if (callingIntervalRef.current) clearInterval(callingIntervalRef.current);
      return;
    }

    const intervalTime = speed === 'SLOW' ? 5000 : speed === 'FAST' ? 2000 : 3500;

    callingIntervalRef.current = setInterval(() => {
      setDeck((prevDeck) => {
        if (prevDeck.length === 0) {
          // All balls drawn
          setPhase('LOBBY');
          return prevDeck;
        }

        const nextBall = prevDeck[0];
        const remainingDeck = prevDeck.slice(1);

        // Visual spin effect
        setIsSpinning(true);
        setTimeout(() => setIsSpinning(false), 800);

        // Update states
        setCurrentBall(nextBall);
        setRecentBalls((prevRecent) => [nextBall, ...prevRecent]);
        setCalledNumbersSet((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.add(nextBall.number);
          return newSet;
        });

        // Trigger sounds
        sounds.playBallPop();
        sounds.speakBall(nextBall.letter, nextBall.number);

        return remainingDeck;
      });
    }, intervalTime);

    return () => {
      if (callingIntervalRef.current) clearInterval(callingIntervalRef.current);
    };
  }, [phase, speed]);

  // Update and evaluate cards whenever calledNumbersSet changes
  useEffect(() => {
    if (calledNumbersSet.size === 0) return;

    setCards((prevCards) => {
      const evaluatedCards = prevCards.map((card) =>
        evaluateCard(card, calledNumbersSet, wallet.autoDaub)
      );

      // Check if autoDaub triggers win automatic claim
      if (wallet.autoDaub && phase === 'CALLING') {
        const fullBingoCard = evaluatedCards.find((c) => c.hasWonBingo);
        if (fullBingoCard && !bingoClaimed) {
          setTimeout(() => handleClaimWin(fullBingoCard.id), 300);
        } else {
          const lineCard = evaluatedCards.find((c) => c.hasWonLine);
          if (lineCard && !lineClaimed) {
            setTimeout(() => handleClaimWin(lineCard.id), 300);
          }
        }
      }

      return evaluatedCards;
    });

    // Virtual players competition simulation
    // As balls increase, virtual players might hit line or bingo
    if (calledNumbersSet.size >= 28 && !lineClaimed && Math.random() < 0.08) {
      const randomPlayer = virtualPlayers[Math.floor(Math.random() * virtualPlayers.length)];
      setLineClaimed(true);
      const prize = jackpotUsdt * 0.2;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'Sistema',
          text: `🎯 ¡${randomPlayer.name} (${randomPlayer.location}) ha cantado LÍNEA! Premio: $${prize.toFixed(2)} USDT`,
          timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        },
      ]);
    }

    if (calledNumbersSet.size >= 46 && !bingoClaimed && Math.random() < 0.12) {
      const randomPlayer = virtualPlayers[Math.floor(Math.random() * virtualPlayers.length)];
      setBingoClaimed(true);
      setPhase('WINNER_CELEBRATION');
      const prize = jackpotUsdt * 0.65;

      setWinnerModalData({
        playerName: `${randomPlayer.name} (${randomPlayer.location})`,
        pattern: 'BINGO',
        prizeAmountUsdt: prize,
        prizeAmountVes: prize * wallet.exchangeRate,
        cardSerial: `BF-${Math.floor(10000 + Math.random() * 90000)}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Occasional chatter in chat
    if (Math.random() < 0.15) {
      const randomPlayer = virtualPlayers[Math.floor(Math.random() * virtualPlayers.length)];
      const randomText = CHAT_CAN_SAY[Math.floor(Math.random() * CHAT_CAN_SAY.length)];
      setChatMessages((prev) => [
        ...prev.slice(-30),
        {
          id: `msg-${Date.now()}`,
          sender: randomPlayer.name,
          text: randomText,
          timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [calledNumbersSet, wallet.autoDaub, phase, bingoClaimed, lineClaimed, virtualPlayers, jackpotUsdt, wallet.exchangeRate, handleClaimWin]);

  // Send Chat message from user
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'Tú',
      text,
      timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const handleNextRound = () => {
    setWinnerModalData(null);
    setPhase('LOBBY');
    setJackpotUsdt((prev) => Math.max(30, prev * 0.5 + 15));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* 3-Zone Top Navigation Bar */}
      <GameHeader
        wallet={wallet}
        onOpenCashier={() => setIsCashierOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Jackpot & Purchase HUD */}
        <JackpotHud
          phase={phase}
          countdown={countdown}
          jackpotUsdt={jackpotUsdt}
          exchangeRate={wallet.exchangeRate}
          cardsCount={cards.length}
          onBuyCards={handleBuyCards}
          onStartGameNow={handleStartGame}
          autoDaub={wallet.autoDaub}
          onToggleAutoDaub={() =>
            setWallet((prev) => ({ ...prev, autoDaub: !prev.autoDaub }))
          }
          cardPriceUsdt={CARD_PRICE_USDT}
          wallet={wallet}
          onOpenCashier={() => setIsCashierOpen(true)}
        />

        {/* 2-Column Split: Left (Tombola & Master Board) / Right (Player Cards & Live Room) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Tombola Caller & Master Board (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6" id="tombola-section">
            <TombolaCaller
              currentBall={currentBall}
              recentBalls={recentBalls}
              calledNumbersSet={calledNumbersSet}
              phase={phase}
              speed={speed}
              onChangeSpeed={(newSpd) => setSpeed(newSpd)}
              soundEnabled={wallet.soundEnabled}
              onToggleSound={() =>
                setWallet((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              voiceEnabled={wallet.voiceEnabled}
              onToggleVoice={() =>
                setWallet((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))
              }
              isSpinning={isSpinning}
            />

            {/* Quick Payment Banner */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Pagos Inmediatos</div>
                  <div className="text-[11px] text-slate-400">Binance Pay (USDT) & Pago Móvil (Bs)</div>
                </div>
              </div>
              <button
                onClick={() => setIsCashierOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
              >
                Recargar / Retirar
              </button>
            </div>
          </div>

          {/* RIGHT: Active Bingo Cards Grid & Live Community Room (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6" id="cards-section">
            {/* Player Cards */}
            <BingoCardsGrid
              cards={cards}
              calledNumbersSet={calledNumbersSet}
              autoDaub={wallet.autoDaub}
              onToggleCell={handleToggleCell}
              onClaimWin={handleClaimWin}
              onShuffleCards={handleShuffleCards}
              phase={phase}
              daubColor={wallet.daubColor}
            />

            {/* Live Community Room & Chat */}
            <LiveRoomChat
              players={virtualPlayers}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              jackpotUsdt={jackpotUsdt}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CashierModal
        isOpen={isCashierOpen}
        onClose={() => setIsCashierOpen(false)}
        wallet={wallet}
        transactions={transactions}
        onAddTransaction={handleAddTransaction}
    
      />

      <WinnerModal
        announcement={winnerModalData}
        onClose={() => setWinnerModalData(null)}
        onOpenCashier={() => setIsCashierOpen(true)}
        onNextRound={handleNextRound}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      
      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Aquí colocamos el nuevo Footer unificado */}
      <Footer />
      
    </div>
  );
}
