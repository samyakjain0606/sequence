// Card suit enum
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

// Card rank enum
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

// Card interface
export interface Card {
  suit: Suit;
  rank: Rank;
  isOneEyedJack: boolean; // One-eyed jacks (Hearts, Spades) can remove opponent's tokens
  isTwoEyedJack: boolean; // Two-eyed jacks (Diamonds, Clubs) are wild cards
}

// Player/team token enum
export enum TokenType {
  NONE = 'none',
  PLAYER1 = 'player1',
  PLAYER2 = 'player2'
}

// Board space interface
export interface BoardSpace {
  card: Card | null; // null for corner spaces
  token: TokenType;
  isCorner: boolean; // Free spaces in the corners
}

// Board interface (10x10 grid)
export type Board = BoardSpace[][];

// Game state interface
export interface GameState {
  board: Board;
  currentTurn: number; // Player index
  players: Player[];
  deck: Card[];
}

// Player interface
export interface Player {
  id: string;
  name: string;
  tokenType: TokenType;
  hand: Card[];
}

export interface Position {
  row: number;
  col: number;
} 