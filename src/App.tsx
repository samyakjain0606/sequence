import React, { useState, useEffect } from 'react';
import './App.css';
import GameLobby from './components/GameLobby';
import GameContainer from './components/GameContainer';
import { Position } from './models/types';
import { useWebSocket, getWebSocketUrl } from './hooks/useWebSocket';
import { motion } from 'framer-motion';
import * as LocalStorage from './utils/localStorage';

function App() {
  // Initialize playerName from localStorage if available
  const [playerName, setPlayerName] = useState<string>(() => LocalStorage.getPlayerName() || '');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Use the WebSocket hook with no URL parameter - it will use the getWebSocketUrl function internally
  const {
    sendMessage,
    gameId,
    error,
    isConnected,
    players,
    isGameStarted,
    gameState,
    playerId
  } = useWebSocket();

  // Save playerName to localStorage when it changes
  useEffect(() => {
    if (playerName) {
      LocalStorage.savePlayerName(playerName);
    }
  }, [playerName]);

  const handleCreateGame = (name: string) => {
    setPlayerName(name);
    sendMessage('CREATE_GAME', { playerName: name });
  };

  const handleJoinGame = (id: string, name: string) => {
    setPlayerName(name);
    sendMessage('JOIN_GAME', { gameId: id, playerName: name });
  };

  const handleMove = (move: { cardIndex: number; position: Position }) => {
    console.log('Making move with player state:', { 
      playerId, 
      gameId, 
      isConnected,
      players,
      isGameStarted 
    });
    
    if (!playerId) {
      console.error('Cannot make move: No player ID available');
      setLocalError('Player ID not available. Please reload the page.');
      return;
    }
    
    if (!gameId) {
      console.error('Cannot make move: No game ID available. Please reload the page or try again.');
      setLocalError('Game connection issue. Please reload the page.');
      return;
    }
    
    if (!isConnected) {
      console.error('Cannot make move: Not connected to server');
      setLocalError('Not connected to server. Please reload the page.');
      return;
    }

    // Include the playerId in the payload for better player identification
    const movePayload = { 
      ...move, 
      gameId,
      playerId // Important: include playerId for the server to identify the player
    };
    
    console.log('Attempting to send move:', {
      move: movePayload,
      gameId,
      type: 'MAKE_MOVE',
      isConnected,
      playerId
    });
    
    try {
      sendMessage('MAKE_MOVE', movePayload);
      console.log('Move sent successfully');
    } catch (error) {
      console.error('Error sending move:', error);
    }
  };

  // Handle for resetting the game (clearing localStorage)
  const handleResetGame = () => {
    LocalStorage.clearGameData();
    window.location.reload();
  };

  // Generate a random card for decoration
  const getRandomCardImage = () => {
    const randomCardSuit = ['HEART', 'SPADE', 'DIAMOND', 'CLUB'][Math.floor(Math.random() * 4)];
    const randomCardRank = Math.floor(Math.random() * 13) + 1;
    let cardRankStr = `${randomCardRank}`;
    if (randomCardRank === 1) cardRankStr = '1';
    if (randomCardRank === 11) cardRankStr = '11-JACK';
    if (randomCardRank === 12) cardRankStr = '12-QUEEN';
    if (randomCardRank === 13) cardRankStr = '13-KING';
    
    return `${process.env.PUBLIC_URL}/cards/${randomCardSuit}-${cardRankStr}.svg`;
  };

  // Show connection error
  if (error || localError) {
    return (
      <div className="App" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: '#fff',
        padding: '20px',
        fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
      }}>
        <motion.div 
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2.5rem',
            borderRadius: '20px',
            backdropFilter: 'blur(15px)',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#ff5a5a',
              margin: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Connection Error
          </motion.h2>
          
          <motion.div
            style={{
              padding: '15px 20px',
              background: 'rgba(255, 59, 59, 0.1)',
              borderRadius: '10px',
              fontSize: '16px',
              color: '#ff8a8a',
              maxWidth: '100%',
              textAlign: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {error || localError}
          </motion.div>
          
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <motion.button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #3a7bd5 0%, #2c3e50 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                flex: '1'
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)'
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Reload Game
            </motion.button>
            
            <motion.button 
              onClick={handleResetGame} 
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #e53935 0%, #8e2222 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                flex: '1'
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)'
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Reset Game
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show waiting screen if game is created but not started
  if (gameId && !isGameStarted) {
    return (
      <div className="App" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: '#fff',
        padding: '20px',
        fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating cards background */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, opacity: 0.15 }}>
          {[...Array(6)].map((_, i) => (
            <motion.img
              key={i}
              src={getRandomCardImage()}
              alt=""
              style={{
                position: 'absolute',
                width: '80px',
                height: '120px',
                left: `${Math.random() * 85}%`,
                top: `${Math.random() * 85}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
                filter: ['drop-shadow(0 5px 15px rgba(0,0,0,0.3))', 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))', 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))']
              }}
              transition={{
                duration: 3 + Math.random() * 3, 
                repeat: Infinity, 
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        <motion.div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2.5rem',
            borderRadius: '20px',
            backdropFilter: 'blur(15px)',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10,
            textAlign: 'center'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img 
            src={getRandomCardImage()}
            alt="Card" 
            style={{
              width: '120px',
              height: '120px',
              marginBottom: '1.5rem',
              marginTop: '-80px',
              filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4))',
            }}
            initial={{ y: -50, opacity: 0, rotate: -5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          />
          
          <motion.h2 
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              margin: '0.5rem 0 1.5rem',
              backgroundImage: 'linear-gradient(135deg, #fff 0%, #9e9e9e 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Game Created!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ fontSize: '16px', opacity: 0.9 }}
          >
            Share this code with your friend to join:
          </motion.p>

          <motion.div 
            style={{
              padding: '18px 24px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              fontSize: '24px',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              marginTop: '16px',
              marginBottom: '30px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ 
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              background: 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <motion.div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                zIndex: 1
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            />
            {gameId}
          </motion.div>

          <motion.div 
            style={{
              marginTop: '20px',
              padding: '18px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '10px' }}>
              Players Joined ({players.length}/2):
            </div>
            {players.map((player, index) => (
              <motion.div 
                key={player.id}
                style={{
                  padding: '8px 15px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginBottom: index < players.length - 1 ? '10px' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.4 }}
              >
                <span>{player.name}</span>
                <span style={{ 
                  fontSize: '12px', 
                  background: player.id === playerId ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: player.id === playerId ? '#4CAF50' : 'inherit',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {player.id === playerId ? 'You' : 'Joined'}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            style={{ 
              marginTop: '30px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '15px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <motion.button
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                flex: '1'
              }}
              whileHover={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResetGame}
            >
              Reset Game
            </motion.button>
            
            <motion.div
              style={{
                padding: '12px 20px',
                background: 'rgba(76, 175, 80, 0.1)',
                color: '#4CAF50',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#4CAF50',
                boxShadow: '0 0 10px #4CAF50',
                animation: 'pulse 1.5s infinite'
              }} />
              Waiting for players...
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Show lobby if not connected or game not started
  if (!isGameStarted) {
    return (
      <GameLobby
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        defaultPlayerName={playerName}
      />
    );
  }

  return (
    <div className="App" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 100 
      }}>
        <motion.button
          style={{
            padding: '8px 16px',
            background: 'rgba(220, 53, 69, 0.2)',
            color: '#fff',
            border: '1px solid rgba(220, 53, 69, 0.4)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          whileHover={{
            background: 'rgba(220, 53, 69, 0.3)',
            borderColor: 'rgba(220, 53, 69, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetGame}
        >
          Reset Game
        </motion.button>
      </div>
      
      <GameContainer
        gameState={gameState}
        onMove={handleMove}
        currentPlayerId={playerId || ''}
      />
    </div>
  );
}

export default App;
