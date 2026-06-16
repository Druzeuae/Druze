/** Tarneeb (Levantine trick-taking) engine — pure helpers. */

export type Suit = "S" | "H" | "D" | "C";
export interface Card {
  suit: Suit;
  rank: number; // 2..14 (J=11, Q=12, K=13, A=14)
}

export const SUITS: Suit[] = ["S", "H", "D", "C"];
export const SUIT_SYMBOL: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
export const SUIT_RED: Record<Suit, boolean> = { S: false, C: false, H: true, D: true };

export function rankLabel(r: number): string {
  if (r === 14) return "A";
  if (r === 13) return "K";
  if (r === 12) return "Q";
  if (r === 11) return "J";
  return String(r);
}

export function sameCard(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

export const teamOf = (player: number): 0 | 1 => (player % 2) as 0 | 1;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deal 13 cards to each of 4 players, sorted by suit then rank. */
export function deal(): Card[][] {
  const deck: Card[] = [];
  for (const s of SUITS) for (let r = 2; r <= 14; r++) deck.push({ suit: s, rank: r });
  const shuffled = shuffle(deck);
  const hands: Card[][] = [[], [], [], []];
  shuffled.forEach((c, i) => hands[i % 4].push(c));
  for (const h of hands) sortHand(h);
  return hands;
}

export function sortHand(h: Card[]) {
  const order: Record<Suit, number> = { S: 0, H: 1, C: 2, D: 3 };
  h.sort((a, b) => (order[a.suit] - order[b.suit]) || b.rank - a.rank);
}

/** Cards a player is allowed to play given the led suit. */
export function legalPlays(hand: Card[], ledSuit: Suit | null): Card[] {
  if (!ledSuit) return hand;
  const inSuit = hand.filter((c) => c.suit === ledSuit);
  return inSuit.length ? inSuit : hand;
}

/** Does card a beat card b, given the led suit and trump? */
export function beats(a: Card, b: Card, ledSuit: Suit, trump: Suit): boolean {
  const aT = a.suit === trump;
  const bT = b.suit === trump;
  if (aT && !bT) return true;
  if (!aT && bT) return false;
  if (aT && bT) return a.rank > b.rank;
  const aLed = a.suit === ledSuit;
  const bLed = b.suit === ledSuit;
  if (aLed && !bLed) return true;
  if (!aLed && bLed) return false;
  if (aLed && bLed) return a.rank > b.rank;
  return false;
}

export interface Play {
  player: number;
  card: Card;
}

/** Index into `plays` of the winning play. */
export function trickWinner(plays: Play[], trump: Suit): number {
  const ledSuit = plays[0].card.suit;
  let bi = 0;
  for (let i = 1; i < plays.length; i++) {
    if (beats(plays[i].card, plays[bi].card, ledSuit, trump)) bi = i;
  }
  return plays[bi].player;
}

/* ------------------------------- Bot AI -------------------------------- */

function highCardPoints(hand: Card[]): number {
  let p = 0;
  for (const c of hand) {
    if (c.rank === 14) p += 1;
    else if (c.rank === 13) p += 0.6;
    else if (c.rank === 12) p += 0.3;
  }
  return p;
}

export function longestSuit(hand: Card[]): Suit {
  let best: Suit = "S";
  let len = -1;
  for (const s of SUITS) {
    const l = hand.filter((c) => c.suit === s).length;
    if (l > len) {
      len = l;
      best = s;
    }
  }
  return best;
}

/** Bot bid: returns a number (7-13) or null to pass. Must exceed currentHigh. */
export function botBid(hand: Card[], currentHigh: number): number | null {
  const hcp = highCardPoints(hand);
  const longest = Math.max(...SUITS.map((s) => hand.filter((c) => c.suit === s).length));
  // estimate tricks the bot's strong hand could take
  const estimate = 6 + hcp + Math.max(0, longest - 4) * 0.7;
  const bid = Math.min(13, Math.floor(estimate));
  if (bid >= 7 && bid > currentHigh) return bid;
  return null;
}

/** Bot picks the best card to play. */
export function botPlay(
  hand: Card[],
  trick: Play[],
  trump: Suit,
  partnerPlayer: number
): Card {
  const ledSuit = trick.length ? trick[0].card.suit : null;
  const legal = legalPlays(hand, ledSuit);
  const lowest = (cards: Card[]) => [...cards].sort((a, b) => a.rank - b.rank)[0];
  const highest = (cards: Card[]) => [...cards].sort((a, b) => b.rank - a.rank)[0];

  if (trick.length === 0) {
    // Leading: lead a high card from the longest non-trump suit, else highest.
    const nonTrump = legal.filter((c) => c.suit !== trump);
    return highest(nonTrump.length ? nonTrump : legal);
  }

  const winnerIdx = trickWinner(trick, trump);
  const winningPlayer = trick[winnerIdx].player;
  const partnerWinning = winningPlayer === partnerPlayer;
  const best = trick.find((p) => p.player === winningPlayer)!.card;

  if (partnerWinning) return lowest(legal); // don't waste cards
  const canWin = legal.filter((c) => beats(c, best, ledSuit ?? c.suit, trump));
  if (canWin.length) return lowest(canWin); // win as cheaply as possible
  return lowest(legal); // can't win — discard low
}
