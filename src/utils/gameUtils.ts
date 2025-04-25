// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Board } from '../models/types';
import { GameState, Player, TokenType } from '../models/types';
import { createSequenceDeck, dealCards, shuffleDeck } from './cardUtils';
import { initializeBoard } from './boardUtils';

// Standard Sequence game settings
const CARDS_PER_PLAYER_2_PLAYERS = 7; // 7 cards per player for 2 players
const CARDS_PER_PLAYER_3_PLAYERS = 6; // 6 cards per player for 3 players
const CARDS_PER_PLAYER_DEFAULT = 5; // 5 cards for 4+ players

// Get number of cards per player based on player count
export const getCardsPerPlayer = (numPlayers: number): number => {
  if (numPlayers === 2) return CARDS_PER_PLAYER_2_PLAYERS;
  if (numPlayers === 3) return CARDS_PER_PLAYER_3_PLAYERS;
  return CARDS_PER_PLAYER_DEFAULT;
};

// Create a player object
export const createPlayer = (id: string, name: string, tokenType: TokenType): Player => {
  return {
    id,
    name,
    tokenType,
    hand: [],
  };
};

// Initialize game state with players
export const initializeGame = (players: Player[]): GameState => {
  // Create and shuffle the deck
  const deck = createSequenceDeck();
  const shuffledDeck = shuffleDeck(deck);
  
  // Define the number of cards per player
  const cardsPerPlayer = getCardsPerPlayer(players.length);
  
  // Deal cards to players
  const { playerHands, remainingDeck } = dealCards(shuffledDeck, players.length, cardsPerPlayer);
  
  // Update player hands
  const updatedPlayers = players.map((player, index) => ({
    ...player,
    hand: playerHands[index],
  }));
  
  // Set up the board with cards from a separate deck
  // In a real game, you would use a predefined board layout
  const boardCards = createSequenceDeck().slice(0, 96); // 96 cards for the board (excluding corners)
  const board = initializeBoard();
  
  // Create the game state
  const gameState: GameState = {
    board,
    currentTurn: 0, // First player starts
    players: updatedPlayers,
    deck: remainingDeck,
  };
  
  return gameState;
};

// Check if a player has won by creating 2 sequences
export const checkForWin = (gameState: GameState): Player | null => {
  // This is a simplified version. For full implementation,
  // you would need to track and count sequences for each player.
  // Also handle team play scenarios.
  
  // For now, we'll just return null indicating no winner yet
  return null;
}; 