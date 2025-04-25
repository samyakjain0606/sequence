import { useState, useEffect, useCallback } from 'react';
import { WebSocketMessage } from '../server/types';
import { GameState } from '../models/types';
import * as LocalStorage from '../utils/localStorage';

// Function to get the correct WebSocket URL based on environment
export const getWebSocketUrl = (): string => {
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return 'ws://localhost:3001/ws';
  }
  
  // For production (Vercel)
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}/ws`;
};

interface UseWebSocketReturn {
  sendMessage: (type: string, payload: any) => void;
  gameId: string | null;
  error: string | null;
  isConnected: boolean;
  players: { id: string; name: string }[];
  isGameStarted: boolean;
  gameState: GameState | null;
  playerId: string | null;
}

export const useWebSocket = (url?: string): UseWebSocketReturn => {
  // Use provided URL or get the default one based on environment
  const wsUrl = url || getWebSocketUrl();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameId, setGameId] = useState<string | null>(() => LocalStorage.getGameId());
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>(() => LocalStorage.getPlayers() || []);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(() => LocalStorage.getIsGameStarted());
  const [gameState, setGameState] = useState<GameState | null>(() => LocalStorage.getGameState());
  const [playerId, setPlayerId] = useState<string | null>(() => LocalStorage.getPlayerId());
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connect = useCallback(() => {
    try {
      console.log('Attempting to connect to WebSocket server...', {
        existingGameId: gameId,
        existingPlayerId: playerId,
        isGameStarted
      });
      
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        setReconnectAttempt(0);
        
        // If we have a gameId and playerId, attempt to reconnect to the game
        if (gameId && playerId && isGameStarted) {
          console.log('Attempting to reconnect to existing game:', {
            gameId,
            playerId
          });
          
          // Send a reconnect message to the server
          const message = JSON.stringify({
            type: 'RECONNECT',
            payload: {
              gameId,
              playerId
            }
          });
          websocket.send(message);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        setIsConnected(false);
        
        // Attempt to reconnect if the game is in progress
        if (isGameStarted && reconnectAttempt < 3) {
          console.log('Attempting to reconnect...', { attempt: reconnectAttempt + 1 });
          setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, 1000 * (reconnectAttempt + 1)); // Exponential backoff
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to server');
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket received message:', {
            type: message.type,
            payload: message.payload,
            timestamp: new Date().toISOString()
          });
          handleMessage(message);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      };

      setWs(websocket);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setError('Failed to create WebSocket connection');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, isGameStarted, reconnectAttempt, gameId, playerId]);

  useEffect(() => {
    connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  // Save game state to localStorage whenever relevant state changes
  useEffect(() => {
    if (gameId) {
      LocalStorage.saveGameId(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    if (playerId) {
      LocalStorage.savePlayerId(playerId);
    }
  }, [playerId]);

  useEffect(() => {
    if (gameState) {
      LocalStorage.saveGameState(gameState);
    }
  }, [gameState]);

  useEffect(() => {
    LocalStorage.saveIsGameStarted(isGameStarted);
  }, [isGameStarted]);

  useEffect(() => {
    if (players.length > 0) {
      LocalStorage.savePlayers(players);
    }
  }, [players]);

  const handleMessage = (message: WebSocketMessage) => {
    console.log('Processing WebSocket message:', {
      type: message.type,
      payload: message.payload,
      currentPlayerId: playerId,
      currentGameId: gameId
    });
    
    switch (message.type) {
      case 'GAME_CREATED':
        console.log('Game created, setting player ID:', message.payload.playerId);
        setGameId(message.payload.gameId);
        setPlayerId(message.payload.playerId);
        setPlayers([{ id: message.payload.playerId, name: message.payload.playerName }]);
        break;

      case 'GAME_JOINED':
        console.log('Game joined, setting player ID and game ID:', {
          playerId: message.payload.playerId,
          gameId: message.payload.gameId
        });
        setGameId(message.payload.gameId);
        setPlayerId(message.payload.playerId);
        setPlayers(message.payload.players);
        break;

      case 'PLAYER_JOINED':
        console.log('Player joined, updating players list and ensuring gameId is set:', {
          players: message.payload.players,
          gameId: message.payload.gameId,
          currentGameId: gameId
        });
        
        // Make sure gameId is set if available
        if (message.payload.gameId && !gameId) {
          setGameId(message.payload.gameId);
        }
        
        setPlayers(message.payload.players);
        break;

      case 'GAME_STARTED':
        console.log('Game started, current player ID and game ID:', {
          playerId,
          gameId: message.payload.gameId || gameId
        });
        
        // Ensure gameId is set if available
        if (message.payload.gameId && !gameId) {
          setGameId(message.payload.gameId);
        }
        
        setIsGameStarted(true);
        setGameState(message.payload.gameState);
        setPlayers(message.payload.players);
        
        // Ensure we have the correct player ID
        if (message.payload.playerId) {
          console.log('Setting player ID from game start:', message.payload.playerId);
          setPlayerId(message.payload.playerId);
        }
        break;

      case 'GAME_STATE_UPDATED':
        setGameState(message.payload.gameState);
        
        // Ensure gameId is set if available
        if (message.payload.gameId && !gameId) {
          console.log('Setting gameId from game state update:', message.payload.gameId);
          setGameId(message.payload.gameId);
        }
        break;

      case 'RECONNECT_SUCCESS':
        console.log('Reconnection successful:', message.payload);
        
        // Update all game state with the received data
        setGameId(message.payload.gameId);
        setPlayerId(message.payload.playerId);
        setPlayers(message.payload.players);
        setIsGameStarted(true);
        setGameState(message.payload.gameState);
        break;

      case 'ERROR':
        console.error('Server error:', message.payload.message, {
          currentPlayerId: playerId,
          currentGameId: gameId
        });
        setError(message.payload.message);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  };

  const sendMessage = useCallback((type: string, payload: any) => {
    console.log('Preparing to send message:', { 
      type, 
      payload,
      currentPlayerId: playerId,
      currentGameId: gameId
    });
    
    if (!ws) {
      console.error('No WebSocket instance available');
      setError('No connection available');
      return;
    }

    if (ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not in OPEN state:', {
        readyState: ws.readyState,
        readyStateString: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState],
        isConnected
      });
      setError('Connection not ready');
      return;
    }

    try {
      // We no longer need to add playerId to MAKE_MOVE messages
      // The server identifies players by their WebSocket connection
      
      const message = JSON.stringify({ type, payload });
      console.log('Sending WebSocket message:', {
        type,
        payload,
        currentPlayerId: playerId, // for debugging only
        timestamp: new Date().toISOString()
      });
      ws.send(message);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  }, [ws, isConnected, playerId, gameId]);

  return {
    sendMessage,
    gameId,
    error,
    isConnected,
    players,
    isGameStarted,
    gameState,
    playerId
  };
}; 