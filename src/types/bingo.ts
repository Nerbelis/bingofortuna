export type BingoLetter = 'B' | 'I' | 'N' | 'G' | 'O';

export interface BingoBall {
  letter: BingoLetter;
  number: number;
  timestamp?: number;
}

export interface BingoCell {
  number: number;
  marked: boolean;
  isFree?: boolean;
}

export interface BingoCard {
  id: string;
  serialNumber: string;
  grid: BingoCell[][]; // 5 rows x 5 columns
  hasWonLine: boolean;
  hasWonCorners: boolean;
  hasWonBingo: boolean;
  distanceToBingo: number;
  distanceToLine: number;
}

export type GamePhase = 'LOBBY' | 'COUNTDOWN' | 'CALLING' | 'WINNER_CELEBRATION' | 'PAUSED';

export type GameSpeed = 'SLOW' | 'NORMAL' | 'FAST';

export interface WinningAnnouncement {
  playerName: string;
  pattern: 'LINEA' | 'ESQUINAS' | 'BINGO';
  prizeAmountUsdt: number;
  prizeAmountVes: number;
  cardSerial: string;
  isUser: boolean;
  timestamp: string;
}

export interface VirtualPlayer {
  id: string;
  name: string;
  avatar: string;
  cardsCount: number;
  location: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  isUser?: boolean;
}

export type PaymentMethod = 'BINANCE' | 'PAGOMOVIL';

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BUY_CARD' | 'PRIZE';
  amountUsdt: number;
  amountVes: number;
  method?: PaymentMethod;
  reference?: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  description: string;
  date: string;
}

export interface UserWallet {
  balanceUsdt: number;
  balanceVes: number;
  exchangeRate: number; // VES per USDT (e.g. 85.50)
  autoDaub: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  daubColor: 'gold' | 'red' | 'cyan' | 'emerald';
}
