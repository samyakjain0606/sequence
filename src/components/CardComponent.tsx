import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../models/types';

interface CardComponentProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
  disabled?: boolean;
}

const cardStyles: React.CSSProperties = {
  width: '100px',
  height: '140px',
  backgroundColor: 'white',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  position: 'absolute',
  transformOrigin: 'bottom center',
  willChange: 'transform',
  userSelect: 'none',
  border: '2px solid #ddd',
};

// Convert card to SVG filename
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

const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isSelected = false,
  onClick,
  index = 0,
  disabled = false,
}) => {
  const variants = {
    initial: {
      opacity: 0,
      y: 100,
      rotateX: 45,
      rotateZ: -10 + (index * 2),
    },
    animate: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      rotateZ: -10 + (index * 2),
      transition: {
        duration: 0.3,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
      },
    },
    hover: {
      y: -20,
      rotateX: 5,
      scale: 1.1,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
    selected: {
      y: -40,
      rotateX: 10,
      scale: 1.15,
      zIndex: 10,
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -100,
      transition: {
        duration: 0.3,
      },
    },
  };
  
  const cardImage = getCardFilename(card);

  return (
    <motion.div
      layout
      style={{
        ...cardStyles,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        left: `${index * 30}px`,
        backgroundImage: `url(${cardImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'white',
      }}
      initial="initial"
      animate={isSelected ? "selected" : "animate"}
      exit="exit"
      whileHover={!disabled && !isSelected ? "hover" : undefined}
      variants={variants}
      custom={index}
      onClick={!disabled ? onClick : undefined}
      data-testid={`card-${card.rank}-${card.suit}`}
    />
  );
};

export default CardComponent; 