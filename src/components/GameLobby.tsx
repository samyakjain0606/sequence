import React, { useState, ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for AnimatePresence TypeScript error
const AnimatePresenceFixedType = AnimatePresence as ElementType;

interface GameLobbyProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (gameId: string, playerName: string) => void;
  defaultPlayerName?: string;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  color: '#fff',
  fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
  position: 'relative',
  overflow: 'hidden',
};

const formStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  padding: '2.5rem',
  borderRadius: '20px',
  backdropFilter: 'blur(15px)',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 10,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  margin: '10px 0',
  border: '2px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.07)',
  color: '#fff',
  fontSize: '16px',
  outline: 'none',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box',
  height: '50px',
  lineHeight: '20px',
  fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  margin: '12px 0',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.3s ease',
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
};

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '2rem',
  fontSize: '2.5rem',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  backgroundImage: 'linear-gradient(135deg, #fff 0%, #9e9e9e 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
};

const cardImageStyle: React.CSSProperties = {
  width: '160px',
  height: '160px',
  marginBottom: '1.5rem',
  marginTop: '-80px',
  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4))',
};

// Background shapes styles
const backgroundShapesStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 1,
  opacity: 0.2,
};

const placeholderStyle = `
  ::placeholder {
    color: rgba(255, 255, 255, 0.5);
    opacity: 1;
  }
  
  ::-webkit-input-placeholder {
    color: rgba(255, 255, 255, 0.5);
    opacity: 1;
  }
  
  :-ms-input-placeholder {
    color: rgba(255, 255, 255, 0.5);
    opacity: 1;
  }
`;

const GameLobby: React.FC<GameLobbyProps> = ({ onCreateGame, onJoinGame, defaultPlayerName = '' }) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [gameId, setGameId] = useState('');
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    }
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && gameId.trim()) {
      onJoinGame(gameId.trim(), playerName.trim());
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.7 } },
  };

  const formVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.3 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
    hover: { 
      scale: 1.03, 
      boxShadow: '0 6px 15px rgba(46, 125, 50, 0.3)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 },
  };

  const secondButtonVariants = {
    ...buttonVariants,
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
  };

  // Generate a random card image for decoration
  const randomCardSuit = ['HEART', 'SPADE', 'DIAMOND', 'CLUB'][Math.floor(Math.random() * 4)];
  const randomCardRank = Math.floor(Math.random() * 13) + 1;
  let cardRankStr = `${randomCardRank}`;
  if (randomCardRank === 1) cardRankStr = '1';
  if (randomCardRank === 11) cardRankStr = '11-JACK';
  if (randomCardRank === 12) cardRankStr = '12-QUEEN';
  if (randomCardRank === 13) cardRankStr = '13-KING';
  
  const randomCardImage = `${process.env.PUBLIC_URL}/cards/${randomCardSuit}-${cardRankStr}.svg`;

  // Background "cards" patterns
  const BackgroundShapes = () => (
    <svg style={backgroundShapesStyle} viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.circle
        cx="90" cy="10" r="8"
        fill="rgba(255,255,255,0.1)"
        animate={{ 
          x: [0, -15, 0], 
          y: [0, 10, 0] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 25,
          ease: "easeInOut" 
        }}
      />
      <motion.rect
        x="20" y="30" width="15" height="20"
        rx="3"
        fill="rgba(255,255,255,0.08)"
        animate={{ 
          rotate: [0, 15, 0],
          x: [0, 20, 0], 
          y: [0, -10, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 30,
          ease: "easeInOut" 
        }}
      />
      <motion.rect
        x="70" y="60" width="12" height="16"
        rx="2"
        fill="rgba(255,255,255,0.06)"
        animate={{ 
          rotate: [0, -10, 0],
          x: [0, -15, 0], 
          y: [0, 15, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "easeInOut" 
        }}
      />
      <motion.circle
        cx="30" cy="80" r="6"
        fill="rgba(255,255,255,0.07)"
        animate={{ 
          x: [0, 25, 0], 
          y: [0, -10, 0] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 22,
          ease: "easeInOut" 
        }}
      />
    </svg>
  );

  return (
    <motion.div
      style={containerStyle}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <style>{placeholderStyle}</style>
      <BackgroundShapes />
      
      <AnimatePresenceFixedType mode="wait">
        <motion.div
          key={mode}
          style={formStyle}
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Card Image */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.img 
              src={randomCardImage} 
              alt="Card" 
              style={cardImageStyle}
              initial={{ y: -50, opacity: 0, rotate: -5 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            />
          </div>
          
          <motion.h1 
            style={titleStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Sequence
          </motion.h1>
          
          {mode === 'select' && (
            <div>
              <motion.button
                style={buttonStyle}
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setMode('create')}
              >
                Create New Game
              </motion.button>
              <motion.button
                style={{ 
                  ...buttonStyle, 
                  background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                  boxShadow: '0 4px 12px rgba(13, 71, 161, 0.2)'
                }}
                variants={secondButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setMode('join')}
              >
                Join Game
              </motion.button>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreateGame}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <label 
                  htmlFor="player-name" 
                  style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    marginBottom: '4px',
                    opacity: 0.9
                  }}
                >
                  Your Name
                </label>
                <input
                  id="player-name"
                  style={{
                    ...inputStyle,
                    border: playerName ? '2px solid rgba(76, 175, 80, 0.3)' : inputStyle.border
                  }}
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  onFocus={(e) => e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)'}
                  onBlur={(e) => e.target.style.border = playerName ? 
                    '2px solid rgba(76, 175, 80, 0.3)' : 
                    '2px solid rgba(255, 255, 255, 0.1)'}
                />
              </motion.div>
              
              <motion.button
                style={buttonStyle}
                type="submit"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
              >
                Create Game
              </motion.button>
              
              <motion.button
                style={{ 
                  ...buttonStyle, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                variants={secondButtonVariants}
                initial="initial"
                animate="animate"
                whileHover={{ 
                  scale: 1.02, 
                  background: 'rgba(255, 255, 255, 0.15)',
                }}
                whileTap="tap"
                onClick={() => setMode('select')}
              >
                Back
              </motion.button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoinGame}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <label 
                  htmlFor="player-name-join" 
                  style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    marginBottom: '4px',
                    opacity: 0.9
                  }}
                >
                  Your Name
                </label>
                <input
                  id="player-name-join"
                  style={{
                    ...inputStyle,
                    border: playerName ? '2px solid rgba(76, 175, 80, 0.3)' : inputStyle.border
                  }}
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  onFocus={(e) => e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)'}
                  onBlur={(e) => e.target.style.border = playerName ? 
                    '2px solid rgba(76, 175, 80, 0.3)' : 
                    '2px solid rgba(255, 255, 255, 0.1)'}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <label 
                  htmlFor="game-id" 
                  style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    marginBottom: '4px',
                    opacity: 0.9
                  }}
                >
                  Game ID
                </label>
                <input
                  id="game-id"
                  style={{
                    ...inputStyle,
                    border: gameId ? '2px solid rgba(33, 150, 243, 0.3)' : inputStyle.border
                  }}
                  type="text"
                  placeholder="Enter game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  required
                  onFocus={(e) => e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)'}
                  onBlur={(e) => e.target.style.border = gameId ? 
                    '2px solid rgba(33, 150, 243, 0.3)' : 
                    '2px solid rgba(255, 255, 255, 0.1)'}
                />
              </motion.div>
              
              <motion.button
                style={{ 
                  ...buttonStyle, 
                  background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                  boxShadow: '0 4px 12px rgba(13, 71, 161, 0.2)'
                }}
                type="submit"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
              >
                Join Game
              </motion.button>
              
              <motion.button
                style={{ 
                  ...buttonStyle, 
                  background: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                variants={secondButtonVariants}
                initial="initial"
                animate="animate"
                whileHover={{ 
                  scale: 1.02, 
                  background: 'rgba(255, 255, 255, 0.15)'
                }}
                whileTap="tap"
                onClick={() => setMode('select')}
              >
                Back
              </motion.button>
            </form>
          )}
        </motion.div>
      </AnimatePresenceFixedType>
    </motion.div>
  );
};

export default GameLobby; 