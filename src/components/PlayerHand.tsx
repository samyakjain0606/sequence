import React from 'react';
import { Card } from '../models/types';
import { LazyMotion, domAnimation, m } from 'framer-motion';

interface PlayerHandProps {
  hand: Card[];
  selectedCardIndex: number | null;
  onCardSelect: (index: number) => void;
}

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

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, selectedCardIndex, onCardSelect }) => {
  // CSS styles for the hand container
  const handContainerStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    background: 'linear-gradient(180deg, rgba(26,26,46,0.8) 0%, #1a1a2e 100%)',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    zIndex: 1000,
  };

  // CSS styles for individual cards
  const getCardStyles = (index: number): React.CSSProperties => {
    const isSelected = selectedCardIndex === index;
    
    return {
      width: '120px',
      height: '180px',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: isSelected 
        ? '0 0 20px rgba(255, 215, 0, 0.8)' 
        : '0 4px 8px rgba(0,0,0,0.1)',
      transform: isSelected ? 'translateY(-30px)' : 'none',
      transition: 'all 0.3s ease',
      position: 'relative',
      border: isSelected ? '3px solid gold' : '1px solid #ddd',
      background: isSelected ? '#fff3cc' : 'white',
      zIndex: isSelected ? 10 : 1,
    };
  };

  // Animation variants for cards
  const cardVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { 
      y: -10,
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
      border: '1px solid gold',
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div style={handContainerStyles}>
        {hand.map((card, index) => {
          const cardImageUrl = getCardFilename(card);
          
          return (
            <m.div
              key={`${card.suit}-${card.rank}-${index}`}
              style={getCardStyles(index)}
              onClick={() => onCardSelect(index)}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ duration: 0.2 }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${cardImageUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                {(card.isOneEyedJack || card.isTwoEyedJack) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '2px 0',
                  }}>
                    {card.isOneEyedJack ? 'Remove Token' : 'Wild Card'}
                  </div>
                )}
              </div>
            </m.div>
          );
        })}
      </div>
    </LazyMotion>
  );
};

export default PlayerHand; 