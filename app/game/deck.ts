export const SYMBOLS = ["🍎", "🍊", "🍇", "🍉", "🍓", "🍌"] as const;

export const TOTAL_PAIRS = SYMBOLS.length;
export const TOTAL_CARDS = TOTAL_PAIRS * 2;

/** 不一致の2枚を表向きのまま見せる時間 */
export const MISS_REVEAL_MS = 900;
/** ペア成立後、次のカードを選べるようになるまでの待ち時間 */
export const MATCH_PAUSE_MS = 500;

export type CardData = {
  id: string;
  symbol: (typeof SYMBOLS)[number];
};

export function createShuffledDeck(previousOrder: readonly string[] = []): CardData[] {
  const deck: CardData[] = SYMBOLS.flatMap((symbol, index) => [
    { id: `${index}-a`, symbol },
    { id: `${index}-b`, symbol },
  ]);

  let shuffled = shuffle(deck);
  let attempts = 0;
  while (isSameOrder(shuffled, previousOrder) && attempts < 8) {
    shuffled = shuffle(deck);
    attempts += 1;
  }
  return shuffled;
}

export function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isSameOrder(deck: readonly CardData[], previousOrder: readonly string[]): boolean {
  if (previousOrder.length !== deck.length) {
    return false;
  }
  return deck.every((card, index) => card.id === previousOrder[index]);
}

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    const swapped = next[swapIndex];
    if (current === undefined || swapped === undefined) {
      continue;
    }
    next[index] = swapped;
    next[swapIndex] = current;
  }
  return next;
}
