import { WebSocket } from 'ws';
import { GameState } from '../models/types';

export interface Player {
  id: string;
  name: string;
  ws: WebSocket;
}

export interface GameSession {
  id: string;
  players: Player[];
  gameState: GameState | null;
}

export type GameSessions = Map<string, GameSession>;

export interface WebSocketMessage {
  type: string;
  payload: any;
} 