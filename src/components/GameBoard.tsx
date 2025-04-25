import React, { ElementType } from 'react';
import { Board, BoardSpace, Card, TokenType, Position } from '../models/types';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

const AnimatePresenceFixedType = AnimatePresence as ElementType;

// CSS styles for the board container
const boardContainerStyles: React.CSSProperties = {
  perspective: '1000px',
  transformStyle: 'preserve-3d',
  width: '650px',
  height: '650px',
  margin: '0 auto',
};

// CSS styles for the board
const boardStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(10, 1fr)',
  gridTemplateRows: 'repeat(10, 1fr)',
  gap: '4px',
  width: '100%',
  height: '100%',
  padding: '10px',
  backgroundColor: '#2c3e50',
  borderRadius: '15px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  transform: 'rotateX(5deg)',
  transformStyle: 'preserve-3d',
};

// CSS styles for a board space
const spaceStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
  fontSize: '14px',
  position: 'relative',
  cursor: 'pointer',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  transformStyle: 'preserve-3d',
  transform: 'translateZ(1px)',
  overflow: 'hidden',
};

// CSS styles for highlighted valid positions
const highlightedSpaceStyles: React.CSSProperties = {
  ...spaceStyles,
  backgroundColor: '#fff3cc',
  boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
  border: '2px solid gold',
  transform: 'translateZ(8px)',
  animation: 'pulse 2s infinite ease-in-out',
  zIndex: 5,
};

// CSS styles for corner spaces
const cornerStyles: React.CSSProperties = {
  ...spaceStyles,
  backgroundColor: '#34495e',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '16px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

// Add keyframe animations
const animations = `
@keyframes pulse {
  0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.7); transform: translateZ(5px); }
  50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.9); transform: translateZ(10px); }
  100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.7); transform: translateZ(5px); }
}

@keyframes hover {
  0% { transform: translateZ(1px); }
  100% { transform: translateZ(10px); }
}

@keyframes placeToken {
  0% { transform: scale(0) rotate(180deg); }
  60% { transform: scale(1.2) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}
`;

// Add the animations to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = animations;
document.head.appendChild(styleSheet);

// CSS styles for tokens
const tokenStyles = (tokenType: TokenType): React.CSSProperties => {
  // Base token styles
  const baseStyles: React.CSSProperties = {
    width: '70%',
    height: '70%',
    borderRadius: '50%',
    position: 'absolute',
    top: '15%',
    left: '15%',
    animation: 'placeToken 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };
  
  // Add color based on token type with modern gradients
  switch (tokenType) {
    case TokenType.PLAYER1:
      return { 
        ...baseStyles, 
        background: 'linear-gradient(135deg, #2196F3, #0D47A1)',
        border: '2px solid #1976D2'
      };
    case TokenType.PLAYER2:
      return { 
        ...baseStyles, 
        background: 'linear-gradient(135deg, #f44336, #b71c1c)',
        border: '2px solid #d32f2f'
      };
    default:
      return baseStyles;
  }
};

// Helper to convert card to SVG filename
const getCardFilename = (card: Card): string => {
  const suitMap = {
    'hearts': 'HEART',
    'diamonds': 'DIAMOND',
    'clubs': 'CLUB',
    'spades': 'SPADE'
  };
  
  const rankMap = {
    'A': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': '11-JACK',
    'Q': '12-QUEEN',
    'K': '13-KING'
  };

  const suit = suitMap[card.suit];
  const rank = rankMap[card.rank];
  
  return `${process.env.PUBLIC_URL}/cards/${suit}-${rank}.svg`;
};

// Component for displaying a single card
const CardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  const cardImageUrl = getCardFilename(card);
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      backgroundImage: `url(${cardImageUrl})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transform: 'translateZ(2px)',
    }} />
  );
};

// Component for a single board space
interface BoardSpaceProps {
  space: BoardSpace;
  row: number;
  col: number;
  isValidPosition: boolean;
  onSpaceClick?: (row: number, col: number) => void;
}

const BoardSpaceComponent: React.FC<BoardSpaceProps> = ({ 
  space, 
  row, 
  col, 
  isValidPosition,
  onSpaceClick 
}) => {
  const handleClick = () => {
    if (onSpaceClick) {
      onSpaceClick(row, col);
    }
  };

  // Determine which style to use
  let currentStyle = space.isCorner ? cornerStyles : spaceStyles;
  if (isValidPosition) {
    currentStyle = highlightedSpaceStyles;
  }

  // Framer Motion variants for hover animation
  const variants = {
    initial: { scale: 1, z: 1 },
    hover: { 
      scale: 1.05, 
      z: 10,
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      transition: { duration: 0.2 }
    }
  };

  // Token animation variants
  const tokenVariants = {
    initial: { scale: 0, rotate: 180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: { scale: 0, rotate: -180 }
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        style={currentStyle}
        onClick={handleClick}
        data-testid={`space-${row}-${col}`}
        initial="initial"
        whileHover="hover"
        variants={variants}
      >
        {space.isCorner ? (
          <div>FREE</div>
        ) : (
          <>
            {space.card && <CardDisplay card={space.card} />}
            <div>
              <AnimatePresenceFixedType mode="wait">
                {space.token !== TokenType.NONE && (
                  <m.div 
                    key={`token-${row}-${col}-${space.token}`}
                    style={tokenStyles(space.token)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={tokenVariants}
                  />
                )}
              </AnimatePresenceFixedType>
            </div>
          </>
        )}
      </m.div>
    </LazyMotion>
  );
};

// Main GameBoard component
interface GameBoardProps {
  board: Board;
  onSpaceClick: (row: number, col: number) => void;
  validPositions: Position[];
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onSpaceClick, validPositions }) => {
  // Create a Set of valid positions for O(1) lookup
  const validPositionsSet = new Set(
    validPositions.map(pos => `${pos.row},${pos.col}`)
  );

  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        style={boardContainerStyles}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={boardStyles} data-testid="game-board">
          {board.map((row, rowIndex) =>
            row.map((space, colIndex) => (
              <BoardSpaceComponent
                key={`${rowIndex}-${colIndex}`}
                space={space}
                row={rowIndex}
                col={colIndex}
                isValidPosition={validPositionsSet.has(`${rowIndex},${colIndex}`)}
                onSpaceClick={onSpaceClick}
              />
            ))
          )}
        </div>
      </m.div>
    </LazyMotion>
  );
};

export default GameBoard; 