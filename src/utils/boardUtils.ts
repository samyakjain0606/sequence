import { Board, BoardSpace, Card, Rank, Suit, TokenType, Position } from '../models/types';

// Create a blank board space
export const createBoardSpace = (card: Card | null = null, isCorner: boolean = false): BoardSpace => {
  return {
    card,
    token: TokenType.NONE,
    isCorner,
  };
};

// Create a new empty 10x10 board
export const createEmptyBoard = (): Board => {
  const board: Board = [];
  for (let i = 0; i < 10; i++) {
    const row: BoardSpace[] = [];
    for (let j = 0; j < 10; j++) {
      row.push(createBoardSpace());
    }
    board.push(row);
  }
  return board;
};

// Set the corner spaces (free spaces)
export const setCornerSpaces = (board: Board): Board => {
  const updatedBoard = [...board];
  
  // Top-left corner
  updatedBoard[0][0] = createBoardSpace(null, true);
  
  // Top-right corner
  updatedBoard[0][9] = createBoardSpace(null, true);
  
  // Bottom-left corner
  updatedBoard[9][0] = createBoardSpace(null, true);
  
  // Bottom-right corner
  updatedBoard[9][9] = createBoardSpace(null, true);
  
  return updatedBoard;
};

// Place a token on the board
export const placeToken = (board: Board, row: number, col: number, tokenType: TokenType): Board => {
  // Create a deep copy of the board
  const newBoard = board.map(r => r.map(space => ({
    ...space,
    card: space.card ? {
      suit: space.card.suit,
      rank: space.card.rank,
      isOneEyedJack: space.card.isOneEyedJack,
      isTwoEyedJack: space.card.isTwoEyedJack
    } : null
  })));
  
  // Place the token
  newBoard[row][col] = {
    ...newBoard[row][col],
    card: newBoard[row][col].card ? {
      suit: newBoard[row][col].card!.suit,
      rank: newBoard[row][col].card!.rank,
      isOneEyedJack: newBoard[row][col].card!.isOneEyedJack,
      isTwoEyedJack: newBoard[row][col].card!.isTwoEyedJack
    } : null,
    token: tokenType,
  };
  
  return newBoard;
};

// Remove a token from the board
export const removeToken = (board: Board, row: number, col: number): Board => {
  // Create a deep copy of the board
  const newBoard = board.map(r => r.map(space => ({
    ...space,
    card: space.card ? {
      suit: space.card.suit,
      rank: space.card.rank,
      isOneEyedJack: space.card.isOneEyedJack,
      isTwoEyedJack: space.card.isTwoEyedJack
    } : null
  })));
  
  // Remove the token
  newBoard[row][col] = {
    ...newBoard[row][col],
    card: newBoard[row][col].card ? {
      suit: newBoard[row][col].card!.suit,
      rank: newBoard[row][col].card!.rank,
      isOneEyedJack: newBoard[row][col].card!.isOneEyedJack,
      isTwoEyedJack: newBoard[row][col].card!.isTwoEyedJack
    } : null,
    token: TokenType.NONE,
  };
  
  return newBoard;
};

// Get all positions where a token can be placed
export const getValidTokenPlacements = (board: Board, tokenType: TokenType): Position[] => {
  const validPositions: Position[] = [];
  
  board.forEach((row, rowIndex) => {
    row.forEach((space, colIndex) => {
      // Space must be empty and not a corner
      if (space.token === TokenType.NONE && !space.isCorner) {
        validPositions.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  
  return validPositions;
};

// Get all positions where a token can be removed
export const getValidTokenRemovals = (board: Board, playerTokenType: TokenType): Position[] => {
  const validPositions: Position[] = [];
  
  board.forEach((row, rowIndex) => {
    row.forEach((space, colIndex) => {
      // Space must have an opponent's token
      if (space.token !== TokenType.NONE && space.token !== playerTokenType) {
        validPositions.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  
  return validPositions;
};

// Check if a position is within board bounds
export const isValidPosition = (board: Board, row: number, col: number): boolean => {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
};

// Get all adjacent positions to a given position
export const getAdjacentPositions = (board: Board, row: number, col: number): Position[] => {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  return directions
    .map(([dRow, dCol]) => ({
      row: row + dRow,
      col: col + dCol
    }))
    .filter(pos => isValidPosition(board, pos.row, pos.col));
};

// Get all positions in a line from a starting position in a given direction
export const getLinePositions = (
  board: Board,
  startRow: number,
  startCol: number,
  directionRow: number,
  directionCol: number,
  length: number
): Position[] => {
  const positions: Position[] = [];
  
  for (let i = 0; i < length; i++) {
    const row = startRow + i * directionRow;
    const col = startCol + i * directionCol;
    
    if (!isValidPosition(board, row, col)) {
      break;
    }
    
    positions.push({ row, col });
  }
  
  return positions;
};

// Check if a sequence can be formed from a position
export const canFormSequence = (
  board: Board,
  row: number,
  col: number,
  tokenType: TokenType,
  sequenceLength: number
): boolean => {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left
  ];
  
  return directions.some(([dRow, dCol]) => {
    // Check forward direction
    const forwardLine = getLinePositions(board, row, col, dRow, dCol, sequenceLength);
    if (forwardLine.length === sequenceLength &&
        forwardLine.every(pos => board[pos.row][pos.col].token === tokenType)) {
      return true;
    }
    
    // Check backward direction
    const backwardLine = getLinePositions(board, row, col, -dRow, -dCol, sequenceLength);
    if (backwardLine.length === sequenceLength &&
        backwardLine.every(pos => board[pos.row][pos.col].token === tokenType)) {
      return true;
    }
    
    return false;
  });
};

const BOARD_LAYOUT = [
  ['♠J', '♦6', '♦7', '♦8', '♦9', '♦10', '♦Q', '♦K', '♦A', '♠2'],
  ['♦5', '♥3', '♥2', '♠2', '♠3', '♠4', '♠5', '♠6', '♠7', '♣A'],
  ['♦4', '♥4', '♦K', '♦A', '♣A', '♣K', '♣Q', '♣10', '♠8', '♣K'],
  ['♦3', '♥5', '♦Q', '♥Q', '♥10', '♥9', '♥8', '♣9', '♠9', '♣Q'],
  ['♦2', '♥6', '♦10', '♥K', '♥3', '♥2', '♥7', '♣8', '♥10', '♣10'],
  ['♠A', '♥7', '♦9', '♥A', '♥4', '♥5', '♥6', '♣7', '♣Q', '♣9'],
  ['♠K', '♥8', '♦8', '♣2', '♣3', '♣4', '♣5', '♣6', '♠K', '♣8'],
  ['♠Q', '♥9', '♦7', '♦6', '♦5', '♦4', '♦3', '♦2', '♠A', '♣7'],
  ['♠10', '♥10', '♥Q', '♥K', '♥A', '♣2', '♣3', '♣4', '♣5', '♣6'],
  ['♣3', '♠9', '♠8', '♠7', '♠6', '♠5', '♠4', '♠3', '♠2', '♠5']
];

const createCard = (cardStr: string): Card | null => {
  if (cardStr === '') return null;
  
  const suitMap: { [key: string]: Suit } = {
    '♠': 'spades',
    '♥': 'hearts',
    '♦': 'diamonds',
    '♣': 'clubs'
  };

  const suit = suitMap[cardStr[0]];
  const rank = cardStr.slice(1) as Rank;

  // One-eyed jacks are spades and hearts
  const isOneEyedJack = rank === 'J' && (suit === 'spades' || suit === 'hearts');
  // Two-eyed jacks are diamonds and clubs
  const isTwoEyedJack = rank === 'J' && (suit === 'diamonds' || suit === 'clubs');

  return { suit, rank, isOneEyedJack, isTwoEyedJack };
};

// Initialize the game board
export const initializeBoard = (): Board => {
  const board: Board = [];
  
  for (let row = 0; row < BOARD_LAYOUT.length; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_LAYOUT[row].length; col++) {
      const isCorner = (row === 0 || row === 9) && (col === 0 || col === 9);
      board[row][col] = {
        card: isCorner ? null : createCard(BOARD_LAYOUT[row][col]),
        token: TokenType.NONE,
        isCorner
      };
    }
  }
  
  return board;
};

// Check if a sequence of 5 tokens exists on the board
export const checkForSequence = (board: Board, tokenType: TokenType): boolean => {
  // Check horizontal sequences
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j <= 5; j++) {
      if (board[i][j].token === tokenType &&
          board[i][j+1].token === tokenType &&
          board[i][j+2].token === tokenType &&
          board[i][j+3].token === tokenType &&
          board[i][j+4].token === tokenType) {
        return true;
      }
    }
  }
  
  // Check vertical sequences
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j < 10; j++) {
      if (board[i][j].token === tokenType &&
          board[i+1][j].token === tokenType &&
          board[i+2][j].token === tokenType &&
          board[i+3][j].token === tokenType &&
          board[i+4][j].token === tokenType) {
        return true;
      }
    }
  }
  
  // Check diagonal sequences (top-left to bottom-right)
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      if (board[i][j].token === tokenType &&
          board[i+1][j+1].token === tokenType &&
          board[i+2][j+2].token === tokenType &&
          board[i+3][j+3].token === tokenType &&
          board[i+4][j+4].token === tokenType) {
        return true;
      }
    }
  }
  
  // Check diagonal sequences (top-right to bottom-left)
  for (let i = 0; i <= 5; i++) {
    for (let j = 4; j < 10; j++) {
      if (board[i][j].token === tokenType &&
          board[i+1][j-1].token === tokenType &&
          board[i+2][j-2].token === tokenType &&
          board[i+3][j-3].token === tokenType &&
          board[i+4][j-4].token === tokenType) {
        return true;
      }
    }
  }
  
  return false;
};

// Get all positions of a specific card on the board
export const getCardPositions = (board: Board, card: Card): Position[] => {
  const positions: Position[] = [];
  
  board.forEach((row, rowIndex) => {
    row.forEach((space, colIndex) => {
      if (space.card && 
          space.card.suit === card.suit && 
          space.card.rank === card.rank) {
        positions.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  
  return positions;
}; 