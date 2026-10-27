import { BingoBall, BingoCard, BingoCell, BingoLetter, VirtualPlayer } from '../types/bingo';

export const LETTER_RANGES: Record<BingoLetter, [number, number]> = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

export const LETTERS: BingoLetter[] = ['B', 'I', 'N', 'G', 'O'];

export const LETTER_COLORS: Record<BingoLetter, { bg: string; text: string; ring: string; border: string }> = {
  B: {
    bg: 'bg-rose-600',
    text: 'text-rose-100',
    ring: 'ring-rose-400',
    border: 'border-rose-500',
  },
  I: {
    bg: 'bg-amber-500',
    text: 'text-amber-950',
    ring: 'ring-amber-300',
    border: 'border-amber-400',
  },
  N: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-100',
    ring: 'ring-emerald-400',
    border: 'border-emerald-500',
  },
  G: {
    bg: 'bg-sky-600',
    text: 'text-sky-100',
    ring: 'ring-sky-400',
    border: 'border-sky-500',
  },
  O: {
    bg: 'bg-purple-600',
    text: 'text-purple-100',
    ring: 'ring-purple-400',
    border: 'border-purple-500',
  },
};

export function getLetterForNumber(num: number): BingoLetter {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

/**
 * Generate a complete shuffled deck of 75 balls
 */
export function generateTombolaDeck(): BingoBall[] {
  const deck: BingoBall[] = [];
  for (let i = 1; i <= 75; i++) {
    deck.push({
      letter: getLetterForNumber(i),
      number: i,
    });
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function getRandomSubarray(arr: number[], size: number): number[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

function generateRangeArray(min: number, max: number): number[] {
  const result: number[] = [];
  for (let i = min; i <= max; i++) {
    result.push(i);
  }
  return result;
}

/**
 * Generate a single valid 75-ball standard Bingo card
 */
export function generateBingoCard(idSuffix: number = 1): BingoCard {
  const columns: number[][] = [
    getRandomSubarray(generateRangeArray(1, 15), 5).sort((a, b) => a - b),
    getRandomSubarray(generateRangeArray(16, 30), 5).sort((a, b) => a - b),
    getRandomSubarray(generateRangeArray(31, 45), 5).sort((a, b) => a - b),
    getRandomSubarray(generateRangeArray(46, 60), 5).sort((a, b) => a - b),
    getRandomSubarray(generateRangeArray(61, 75), 5).sort((a, b) => a - b),
  ];

  // Grid is 5 rows x 5 columns
  const grid: BingoCell[][] = [];
  for (let row = 0; row < 5; row++) {
    const rowCells: BingoCell[] = [];
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        // Free center space
        rowCells.push({
          number: 0,
          marked: true,
          isFree: true,
        });
      } else {
        rowCells.push({
          number: columns[col][row],
          marked: false,
        });
      }
    }
    grid.push(rowCells);
  }

  const serial = `BF-${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    id: `card-${Date.now()}-${idSuffix}`,
    serialNumber: serial,
    grid,
    hasWonLine: false,
    hasWonCorners: false,
    hasWonBingo: false,
    distanceToBingo: 24,
    distanceToLine: 4,
  };
}

/**
 * Calculate card pattern status and minimum distances to win
 */
export function evaluateCard(card: BingoCard, calledSet: Set<number>, autoDaub: boolean): BingoCard {
  // Update marks if autoDaub is on
  const updatedGrid = card.grid.map((row) =>
    row.map((cell) => {
      if (cell.isFree) return { ...cell, marked: true };
      if (autoDaub && calledSet.has(cell.number)) {
        return { ...cell, marked: true };
      }
      return cell;
    })
  );

  // Check 4 corners: (0,0), (0,4), (4,0), (4,4)
  const cornersMarked =
    updatedGrid[0][0].marked &&
    updatedGrid[0][4].marked &&
    updatedGrid[4][0].marked &&
    updatedGrid[4][4].marked;

  // Calculate lines (5 horizontal, 5 vertical, 2 diagonals)
  const lineUnmarkedCounts: number[] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    const unmarked = updatedGrid[r].filter((c) => !c.marked).length;
    lineUnmarkedCounts.push(unmarked);
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    let unmarked = 0;
    for (let r = 0; r < 5; r++) {
      if (!updatedGrid[r][c].marked) unmarked++;
    }
    lineUnmarkedCounts.push(unmarked);
  }

  // Main diagonal
  let diag1Unmarked = 0;
  for (let i = 0; i < 5; i++) {
    if (!updatedGrid[i][i].marked) diag1Unmarked++;
  }
  lineUnmarkedCounts.push(diag1Unmarked);

  // Anti diagonal
  let diag2Unmarked = 0;
  for (let i = 0; i < 5; i++) {
    if (!updatedGrid[i][4 - i].marked) diag2Unmarked++;
  }
  lineUnmarkedCounts.push(diag2Unmarked);

  const minLineDist = Math.min(...lineUnmarkedCounts);
  const hasLine = minLineDist === 0;

  // Total unmarked for Full House
  let totalUnmarked = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (!updatedGrid[r][c].marked) totalUnmarked++;
    }
  }
  const hasBingo = totalUnmarked === 0;

  return {
    ...card,
    grid: updatedGrid,
    hasWonLine: hasLine,
    hasWonCorners: cornersMarked,
    hasWonBingo: hasBingo,
    distanceToLine: minLineDist,
    distanceToBingo: totalUnmarked,
  };
}

/**
 * Community virtual players for live Venezuelan & Latin American multiplayer feeling
 */
export const INITIAL_VIRTUAL_PLAYERS: VirtualPlayer[] = [
  { id: 'vp-1', name: 'Carlos_Caracas', avatar: '🇻🇪', cardsCount: 3, location: 'Caracas' },
  { id: 'vp-2', name: 'Mariana_Zulia', avatar: '🌟', cardsCount: 2, location: 'Maracaibo' },
  { id: 'vp-3', name: 'CryptoChamo', avatar: '🪙', cardsCount: 4, location: 'Valencia' },
  { id: 'vp-4', name: 'Elena_Barquisimeto', avatar: '🎯', cardsCount: 2, location: 'Lara' },
  { id: 'vp-5', name: 'Pedro_Banesco', avatar: '⚡', cardsCount: 3, location: 'Margarita' },
  { id: 'vp-6', name: 'Sofía_Táchira', avatar: '🍀', cardsCount: 1, location: 'San Cristóbal' },
  { id: 'vp-7', name: 'Andrés_Guayana', avatar: '💎', cardsCount: 3, location: 'Pto. Ordaz' },
  { id: 'vp-8', name: 'Yusleidy_Mérida', avatar: '✨', cardsCount: 2, location: 'Mérida' },
];

export const CHAT_CAN_SAY = [
  '¡Vamos que hoy me saco el acumulado!',
  '¡Pásame el B-12 que con esa canto línea!',
  'Buena suerte a todos muchachos',
  '¡Casi! Me falta 1 para cartón lleno',
  'Recargué por Pago Móvil al toque, súper rápido',
  'Binance Pay acreditó al segundo 🔥',
  '¡Epa, que salgan las G!',
  '¡Falta una nada más!',
  '¡Qué emoción esta sala!',
  '¡Vamos Caracas con todo!',
];
