import { GameState, Card, TokenType, Player, Position } from '../models/types';
import { getCardPositions } from './boardUtils';
import { placeToken, removeToken } from './boardUtils';

// Interface for move validation result
export interface MoveValidationResult {
  isValid: boolean;
  message: string;
  updatedState?: GameState;
}

// Interface for game rules configuration
export interface GameRulesConfig {
  sequencesToWin: number;
  maxPlayers: number;
  minPlayers: number;
}

// Default game rules
export const DEFAULT_RULES: GameRulesConfig = {
  sequencesToWin: 2,
  maxPlayers: 12,
  minPlayers: 2,
};

// Validate if it's a player's turn
export const isPlayerTurn = (gameState: GameState, playerId: string): boolean => {
  const currentPlayer = gameState.players[gameState.currentTurn];
  console.log('Checking player turn:', {
    playerId,
    currentTurnIndex: gameState.currentTurn,
    currentPlayerId: currentPlayer.id,
    currentPlayerTokenType: currentPlayer.tokenType,
    allPlayers: gameState.players.map(p => ({ 
      id: p.id, 
      tokenType: p.tokenType,
      isCurrentTurn: p.id === currentPlayer.id 
    }))
  });
  
  const isValid = currentPlayer.id === playerId;
  console.log('Turn validation result:', { isValid });
  return isValid;
};

// Validate if a card can be played at a position
export const validateCardPlay = (
  gameState: GameState,
  card: Card,
  row: number,
  col: number
): MoveValidationResult => {
  const currentPlayer = gameState.players[gameState.currentTurn];
  
  // Handle one-eyed Jack (remove token)
  if (card.isOneEyedJack) {
    const space = gameState.board[row][col];
    if (space.token === TokenType.NONE) {
      return {
        isValid: false,
        message: 'No token to remove',
      };
    }
    if (space.token === currentPlayer.tokenType) {
      return {
        isValid: false,
        message: 'Cannot remove your own token',
      };
    }
    return {
      isValid: true,
      message: 'Valid move: Remove opponent token',
    };
  }
  
  // Handle two-eyed Jack (wild card)
  if (card.isTwoEyedJack) {
    const space = gameState.board[row][col];
    if (space.token !== TokenType.NONE || space.isCorner) {
      return {
        isValid: false,
        message: 'Space is not available',
      };
    }
    return {
      isValid: true,
      message: 'Valid move: Wild card placement',
    };
  }
  
  // Regular card
  const cardPositions = getCardPositions(gameState.board, card);
  
  if (cardPositions.length === 0) {
    return {
      isValid: false,
      message: 'Card does not match any board position',
    };
  }
  
  // Check if the selected position matches any of the valid positions for this card
  const isValidPosition = cardPositions.some(pos => pos.row === row && pos.col === col);
  if (!isValidPosition) {
    return {
      isValid: false,
      message: 'Selected position does not match card',
    };
  }
  
  if (gameState.board[row][col].token !== TokenType.NONE) {
    return {
      isValid: false,
      message: 'Space is already occupied',
    };
  }
  
  return {
    isValid: true,
    message: 'Valid move',
  };
};

// Process a card play and update game state
export const processCardPlay = (
  gameState: GameState,
  cardIndex: number,
  row: number,
  col: number
): MoveValidationResult => {
  console.log('Processing move:', { cardIndex, row, col });
  const currentPlayer = gameState.players[gameState.currentTurn];
  const card = currentPlayer.hand[cardIndex];
  
  console.log('Current player:', { 
    id: currentPlayer.id, 
    tokenType: currentPlayer.tokenType,
    cardPlayed: { suit: card.suit, rank: card.rank }
  });
  
  // Validate the move
  const validation = validateCardPlay(gameState, card, row, col);
  if (!validation.isValid) {
    console.log('Move validation failed:', validation.message);
    return validation;
  }
  
  // Create updated game state with deep cloning
  const updatedState: GameState = {
    ...gameState,
    board: gameState.board.map(row => [...row]),
    players: gameState.players.map(player => ({
      ...player,
      hand: [...player.hand]
    })),
    deck: [...gameState.deck]
  };
  
  // Update board using the utility functions
  if (card.isOneEyedJack) {
    console.log('Removing token at position:', { row, col });
    updatedState.board = removeToken(updatedState.board, row, col);
  } else {
    console.log('Placing token at position:', { row, col, tokenType: currentPlayer.tokenType });
    updatedState.board = placeToken(updatedState.board, row, col, currentPlayer.tokenType);
  }
  
  // Verify token placement
  console.log('Board space after update:', updatedState.board[row][col]);
  
  // Update player's hand
  const playerIndex = gameState.currentTurn;
  const playerHand = [...updatedState.players[playerIndex].hand];
  playerHand.splice(cardIndex, 1);
  
  // Draw new card if available
  if (updatedState.deck.length > 0) {
    const newCard = updatedState.deck.pop()!;
    playerHand.push(newCard);
    console.log('Drew new card:', { suit: newCard.suit, rank: newCard.rank });
  }
  
  // Update players array
  updatedState.players = updatedState.players.map((player, index) => {
    if (index === playerIndex) {
      return { ...player, hand: playerHand };
    }
    return player;
  });
  
  // Move to next player's turn
  updatedState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
  console.log('Next turn:', { playerIndex: updatedState.currentTurn });
  
  return {
    isValid: true,
    message: 'Move processed successfully',
    updatedState,
  };
};

// Validate game setup
export const validateGameSetup = (players: Player[]): MoveValidationResult => {
  if (players.length < DEFAULT_RULES.minPlayers) {
    return {
      isValid: false,
      message: `Need at least ${DEFAULT_RULES.minPlayers} players`,
    };
  }
  
  if (players.length > DEFAULT_RULES.maxPlayers) {
    return {
      isValid: false,
      message: `Maximum ${DEFAULT_RULES.maxPlayers} players allowed`,
    };
  }
  
  // Check for duplicate token colors
  const tokenTypes = new Set(players.map(p => p.tokenType));
  if (tokenTypes.size !== players.length) {
    return {
      isValid: false,
      message: 'Each player must have a unique token color',
    };
  }
  
  return {
    isValid: true,
    message: 'Valid game setup',
  };
}; 