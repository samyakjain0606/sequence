import React, { useState, useEffect } from 'react';
import { GameState, TokenType, Position } from '../models/types';
import { getCardPositions } from '../utils/boardUtils';
// import { findCardOnBoard } from '../utils/cardUtils';
import GameBoard from './GameBoard';
import PlayerHand from './PlayerHand';
import { LazyMotion, domAnimation, m } from 'framer-motion';

// CSS styles for game container
const containerStyles: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '10px',
  paddingBottom: '220px', // Add padding at the bottom to account for the fixed hand
  position: 'relative', // For absolute positioning of the floating title
};

// // CSS styles for floating title
// const floatingTitleStyles: React.CSSProperties = {
//   position: 'absolute',
//   left: '10px',
//   top: '50%',
//   transform: 'translateY(-50%) rotate(-90deg)',
//   transformOrigin: 'left center',
//   fontSize: '2.5rem',
//   fontWeight: 700,
//   color: 'rgba(255, 255, 255, 0.15)',
//   letterSpacing: '5px',
//   textTransform: 'uppercase',
//   pointerEvents: 'none',
//   zIndex: 0,
//   textShadow: '0 0 10px rgba(76, 175, 80, 0.2)',
// };

// CSS styles for status display
const statusStyles: React.CSSProperties = {
  textAlign: 'center',
  margin: '15px 0',
  padding: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  fontWeight: 'bold',
  color: '#fff',
  backdropFilter: 'blur(5px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
};

// CSS styles for player status
const playerStatusStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '12px 0',
  padding: '8px 20px',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '12px',
  backdropFilter: 'blur(5px)',
  position: 'relative',
};

// CSS styles for sequence title in player bar
const sequenceTitleStyles: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  letterSpacing: '3px',
  color: 'rgba(255, 215, 0, 0.9)',
  textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
  margin: '0 15px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

// CSS styles for player container
const playerContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  alignItems: 'center',
};

// CSS styles for active player
const activePlayerStyles: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#4CAF50',
  border: '2px solid #4CAF50',
  borderRadius: '8px',
  padding: '10px',
  background: 'rgba(76, 175, 80, 0.1)',
  boxShadow: '0 0 15px rgba(76, 175, 80, 0.3)',
  transition: 'all 0.3s ease',
};

// CSS styles for inactive player
const inactivePlayerStyles: React.CSSProperties = {
  color: '#fff',
  padding: '10px',
  opacity: 0.7,
  transition: 'all 0.3s ease',
};

interface GameContainerProps {
  gameState: GameState | null;
  onMove: (move: { cardIndex: number; position: Position }) => void;
  currentPlayerId: string;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameState, onMove, currentPlayerId }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [validPositions, setValidPositions] = useState<Position[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Waiting for game to start...');

  // Get current player's information
  const currentPlayer = gameState?.players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = gameState?.players.findIndex(p => p.id === currentPlayerId);
  const isCurrentPlayerTurn = currentPlayer && gameState ? 
    gameState.players[gameState.currentTurn].id === currentPlayer.id : false;

  console.log('Turn state:', {
    currentPlayerId,
    currentPlayerIndex,
    currentTurn: gameState?.currentTurn,
    currentTurnPlayerId: gameState?.players[gameState?.currentTurn]?.id,
    isCurrentPlayerTurn,
    allPlayers: gameState?.players.map(p => ({ id: p.id, name: p.name, tokenType: p.tokenType }))
  });

  useEffect(() => {
    if (gameState) {
      if (isCurrentPlayerTurn) {
        setStatusMessage("It's your turn!");
      } else {
        const activePlayer = gameState.players[gameState.currentTurn];
        setStatusMessage(`Waiting for ${activePlayer?.name || 'opponent'} to play...`);
      }
    }
  }, [gameState?.currentTurn, isCurrentPlayerTurn, gameState]);

  // Handle card selection
  const handleCardSelect = (index: number) => {
    if (!gameState || !isCurrentPlayerTurn || !currentPlayer) return;

    // If selecting the same card, deselect it
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null);
      setValidPositions([]);
      return;
    }

    const card = currentPlayer.hand[index];
    if (!card) return;

    // Calculate valid positions based on card type
    let positions: Position[] = [];
    if (card.isOneEyedJack) {
      // For one-eyed jacks, valid positions are opponent tokens
      gameState.board.forEach((row, rowIndex) => {
        row.forEach((space, colIndex) => {
          const token = space.token;
          if (token !== TokenType.NONE && token !== currentPlayer.tokenType) {
            positions.push({ row: rowIndex, col: colIndex });
          }
        });
      });
    } else if (card.isTwoEyedJack) {
      // For two-eyed jacks, valid positions are empty spaces
      gameState.board.forEach((row, rowIndex) => {
        row.forEach((space, colIndex) => {
          if (space.token === TokenType.NONE && !space.isCorner) {
            positions.push({ row: rowIndex, col: colIndex });
          }
        });
      });
    } else {
      // For regular cards, get all matching card positions that aren't occupied
      positions = getCardPositions(gameState.board, card).filter(pos => 
        gameState.board[pos.row][pos.col].token === TokenType.NONE
      );
    }

    setSelectedCardIndex(index);
    setValidPositions(positions);
    setStatusMessage(positions.length > 0 
      ? 'Select a highlighted space to place your token' 
      : 'No valid moves available for this card. Select another card.');
  };

  // Handle board space click
  const handleBoardSpaceClick = (row: number, col: number) => {
    if (!gameState || selectedCardIndex === null || !isCurrentPlayerTurn) {
      console.log('Board click prevented:', {
        hasGameState: !!gameState,
        selectedCardIndex,
        isCurrentPlayerTurn,
        currentPlayerId,
        currentTurn: gameState?.currentTurn
      });
      return;
    }

    // Check if the clicked position is valid
    const isValidMove = validPositions.some(pos => pos.row === row && pos.col === col);
    if (!isValidMove) {
      setStatusMessage('Invalid move! Please select a highlighted space.');
      return;
    }

    console.log('Making move:', {
      cardIndex: selectedCardIndex,
      position: { row, col },
      currentPlayerId,
      currentTurn: gameState.currentTurn
    });

    // Send the move to the server
    onMove({ cardIndex: selectedCardIndex, position: { row, col } });

    // Reset selection
    setSelectedCardIndex(null);
    setValidPositions([]);
  };

  if (!gameState || !currentPlayer) {
    return <div style={containerStyles}>Waiting for game to start...</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div style={containerStyles}>
        {/* Floating Sequence title */}
        {/* <m.div 
          style={floatingTitleStyles}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Sequence
        </m.div> */}
        
        <m.div 
          style={playerStatusStyles}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={playerContainerStyles}>
            {gameState.players.slice(0, Math.ceil(gameState.players.length / 2)).map((player) => (
              <m.div 
                key={player.id} 
                style={player.id === gameState.players[gameState.currentTurn].id ? activePlayerStyles : inactivePlayerStyles}
                whileHover={{ scale: 1.05 }}
              >
                {player.name}
                {player.id === currentPlayerId && ' (You)'}
              </m.div>
            ))}
          </div>
          
          <m.div 
            style={sequenceTitleStyles}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Sequence
          </m.div>
          
          <div style={playerContainerStyles}>
            {gameState.players.slice(Math.ceil(gameState.players.length / 2)).map((player) => (
              <m.div 
                key={player.id} 
                style={player.id === gameState.players[gameState.currentTurn].id ? activePlayerStyles : inactivePlayerStyles}
                whileHover={{ scale: 1.05 }}
              >
                {player.name}
                {player.id === currentPlayerId && ' (You)'}
              </m.div>
            ))}
          </div>
        </m.div>
        
        <m.div 
          style={statusStyles}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {statusMessage}
        </m.div>
        
        <div style={{ marginBottom: '100px' }}>
          <GameBoard 
            board={gameState.board} 
            onSpaceClick={handleBoardSpaceClick}
            validPositions={validPositions}
          />
        </div>
        
        <PlayerHand 
          hand={currentPlayer.hand}
          selectedCardIndex={selectedCardIndex}
          onCardSelect={handleCardSelect}
        />
      </div>
    </LazyMotion>
  );
};

export default GameContainer; 