import { Card, Suit, Rank } from '../models/types';

// Check if a card is a one-eyed Jack (Hearts or Spades)
export const isOneEyedJack = (card: Card): boolean => {
  return card.rank === 'J' && (card.suit === 'hearts' || card.suit === 'spades');
};

// Check if a card is a two-eyed Jack (Diamonds or Clubs)
export const isTwoEyedJack = (card: Card): boolean => {
  return card.rank === 'J' && (card.suit === 'diamonds' || card.suit === 'clubs');
};

// Create a single card
export const createCard = (suit: Suit, rank: Rank): Card => {
  const card: Card = {
    suit,
    rank,
    isOneEyedJack: rank === 'J' && (suit === 'hearts' || suit === 'spades'),
    isTwoEyedJack: rank === 'J' && (suit === 'diamonds' || suit === 'clubs'),
  };
  return card;
};

// Create a full deck of cards
export const createSequenceDeck = (): Card[] => {
  const deck: Card[] = [];
  
  // Define all suits and ranks
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  // Create cards for each suit and rank combination
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(createCard(suit, rank));
    }
  }
  
  // Duplicate each card (Sequence game uses two decks)
  return [...deck, ...deck];
};

// Create a standard 52-card deck
export const createStandardDeck = (): Card[] => {
  const deck: Card[] = [];
  
  // Define all suits and ranks
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  // Create cards for each suit and rank combination
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(createCard(suit, rank));
    }
  }
  
  return deck;
};

// Shuffle a deck using the Fisher-Yates algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffledDeck = [...deck];
  
  // Fisher-Yates shuffle
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  
  return shuffledDeck;
};

// Deal cards to players
export const dealCards = (deck: Card[], numPlayers: number, cardsPerPlayer: number): { playerHands: Card[][], remainingDeck: Card[] } => {
  // Make a copy of the deck to avoid modifying the original
  const deckCopy = [...deck];
  
  // Initialize player hands
  const playerHands: Card[][] = Array(numPlayers).fill([]).map(() => []);
  
  // Deal cards to each player
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < numPlayers; j++) {
      if (deckCopy.length > 0) {
        const card = deckCopy.pop()!;
        playerHands[j] = [...playerHands[j], card];
      }
    }
  }
  
  return {
    playerHands,
    remainingDeck: deckCopy,
  };
};

// Draw a card from the deck
export const drawCard = (deck: Card[]): { card: Card, remainingDeck: Card[] } => {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  
  const deckCopy = [...deck];
  const card = deckCopy.pop()!;
  
  return {
    card,
    remainingDeck: deckCopy,
  };
};

// Find a matching card position on the board
export const findCardOnBoard = (boardCards: (Card | null)[][], card: Card): { row: number, col: number } | null => {
  for (let i = 0; i < boardCards.length; i++) {
    for (let j = 0; j < boardCards[i].length; j++) {
      const boardCard = boardCards[i][j];
      
      // Skip empty spaces (corners or null cards)
      if (!boardCard) continue;
      
      // Check if cards match
      if (boardCard.rank === card.rank && boardCard.suit === card.suit) {
        return { row: i, col: j };
      }
    }
  }
  
  // Card not found on board
  return null;
}; 