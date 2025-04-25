import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketMessage, GameSessions, GameSession, Player } from './types';
import { initializeGame, createPlayer } from '../utils/gameUtils';
import { TokenType } from '../models/types';
import { processCardPlay, isPlayerTurn } from '../utils/gameRules';
import path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// In-memory game session storage (will reset on server restart)
// For production, consider using Redis or another persistent store
const gameSessions: GameSessions = new Map();

// Add API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../build', 'index.html'));
  });
}

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
      console.log('Server received message:', parsedMessage);
      handleMessage(ws, parsedMessage);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // We don't remove players immediately as they might reconnect
  });
});

function handleMessage(ws: WebSocket, message: WebSocketMessage) {
  console.log('Handling message:', { type: message.type, payload: message.payload });
  
  switch (message.type) {
    case 'CREATE_GAME':
      createGame(ws, message.payload?.playerName);
      break;
    case 'JOIN_GAME':
      joinGame(ws, message.payload.gameId, message.payload?.playerName);
      break;
    case 'MAKE_MOVE':
      handleMove(ws, message.payload);
      break;
    case 'RECONNECT':
      handleReconnect(ws, message.payload);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
}

function handleReconnect(ws: WebSocket, payload: any) {
  const { gameId, playerId } = payload;
  console.log('Handling reconnection attempt:', { gameId, playerId });

  if (!gameId || !playerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Game ID and Player ID are required' }
    }));
    return;
  }

  const gameSession = gameSessions.get(gameId);
  if (!gameSession) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Game not found' }
    }));
    return;
  }

  // Find player by ID
  const playerIndex = gameSession.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Player not found in this game' }
    }));
    return;
  }

  // Update the websocket connection for the player
  gameSession.players[playerIndex].ws = ws;
  console.log(`Player ${playerId} reconnected to game ${gameId}`);

  // Send game state back to reconnected player
  ws.send(JSON.stringify({
    type: 'RECONNECT_SUCCESS',
    payload: {
      gameId,
      playerId,
      players: gameSession.players.map(p => ({ id: p.id, name: p.name })),
      gameState: gameSession.gameState
    }
  }));
}

function createGame(ws: WebSocket, playerName: string = 'Player 1') {
  const gameId = uuidv4();
  const player: Player = {
    id: uuidv4(),
    name: playerName,
    ws
  };
  
  const gameSession: GameSession = {
    id: gameId,
    players: [player],
    gameState: null,
  };
  
  gameSessions.set(gameId, gameSession);
  
  ws.send(JSON.stringify({
    type: 'GAME_CREATED',
    payload: { 
      gameId, 
      playerId: player.id,
      players: [{ id: player.id, name: player.name }]
    }
  }));
}

function joinGame(ws: WebSocket, gameId: string, playerName: string = 'Player 2') {
  const gameSession = gameSessions.get(gameId);
  
  if (!gameSession) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Game not found' }
    }));
    return;
  }
  
  if (gameSession.players.length >= 2) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Game is full' }
    }));
    return;
  }
  
  const player: Player = {
    id: uuidv4(),
    name: playerName,
    ws
  };
  
  gameSession.players.push(player);
  
  // Send specific GAME_JOINED message to the player who just joined
  ws.send(JSON.stringify({
    type: 'GAME_JOINED',
    payload: { 
      gameId,
      playerId: player.id,
      players: gameSession.players.map(p => ({ id: p.id, name: p.name }))
    }
  }));
  
  // Notify all players that someone joined
  gameSession.players.forEach(player => {
    player.ws.send(JSON.stringify({
      type: 'PLAYER_JOINED',
      payload: { 
        gameId,
        playerCount: gameSession.players.length,
        players: gameSession.players.map(p => ({ id: p.id, name: p.name }))
      }
    }));
  });
  
  // If game is full, start the game
  if (gameSession.players.length === 2) {
    startGame(gameSession);
  }
}

function handleMove(ws: WebSocket, payload: any) {
  const { gameId, cardIndex, position, playerId } = payload;
  const gameSession = gameSessions.get(gameId);

  console.log('Handling move:', {
    gameId,
    cardIndex,
    position,
    playerId,
    sessionExists: !!gameSession,
    gameStateExists: !!gameSession?.gameState
  });

  if (!gameSession || !gameSession.gameState) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Game not found or not started' }
    }));
    return;
  }

  // Find the player either by WebSocket connection or by playerId if provided
  let player = gameSession.players.find(p => p.ws === ws);
  
  // If player not found by WebSocket, try to find by ID (useful for reconnection scenarios)
  if (!player && playerId) {
    player = gameSession.players.find(p => p.id === playerId);
    // If found by ID but has different WebSocket, update the WebSocket
    if (player) {
      console.log(`Found player by ID ${playerId}, updating WebSocket connection`);
      player.ws = ws;
    }
  }
  
  console.log('Player attempting move:', {
    playerId: player?.id,
    playerName: player?.name,
    receivedPlayerId: playerId,
    currentTurn: gameSession.gameState.currentTurn,
    allPlayers: gameSession.players.map(p => ({ id: p.id, name: p.name }))
  });

  if (!player) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Player not found in game' }
    }));
    return;
  }

  // Validate if it's the player's turn
  const isValidTurn = isPlayerTurn(gameSession.gameState, player.id);
  console.log('Turn validation:', {
    playerId: player.id,
    currentTurnIndex: gameSession.gameState.currentTurn,
    currentTurnPlayerId: gameSession.gameState.players[gameSession.gameState.currentTurn].id,
    isValidTurn
  });

  if (!isValidTurn) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: 'Not your turn' }
    }));
    return;
  }

  // Process the move
  const result = processCardPlay(
    gameSession.gameState,
    cardIndex,
    position.row,
    position.col
  );

  if (!result.isValid || !result.updatedState) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message: result.message }
    }));
    return;
  }

  // Update game state
  gameSession.gameState = result.updatedState;

  // Notify all players of the updated state
  gameSession.players.forEach(player => {
    player.ws.send(JSON.stringify({
      type: 'GAME_STATE_UPDATED',
      payload: { 
        gameId,
        gameState: gameSession.gameState
      }
    }));
  });
}

function startGame(gameSession: GameSession) {
  // Create player objects with token types
  const gamePlayers = gameSession.players.map((player, index) => 
    createPlayer(
      player.id, 
      player.name, 
      index === 0 ? TokenType.PLAYER1 : TokenType.PLAYER2
    )
  );

  // Initialize game state
  const gameState = initializeGame(gamePlayers);
  gameSession.gameState = gameState;

  // Send game started message with initial state to all players
  gameSession.players.forEach(player => {
    player.ws.send(JSON.stringify({
      type: 'GAME_STARTED',
      payload: { 
        gameId: gameSession.id,
        gameState,
        players: gamePlayers.map(p => ({ id: p.id, name: p.name })),
        playerId: player.id
      }
    }));
  });
}

export function startServer(port: number = 3001) {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  return server;
} 