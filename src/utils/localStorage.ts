import { GameState } from '../models/types';

// Keys for localStorage
const STORAGE_KEYS = {
  GAME_ID: 'sequence_game_id',
  PLAYER_ID: 'sequence_player_id',
  PLAYER_NAME: 'sequence_player_name',
  GAME_STATE: 'sequence_game_state',
  IS_GAME_STARTED: 'sequence_game_started',
  PLAYERS: 'sequence_players'
};

// Save game ID to localStorage
export const saveGameId = (gameId: string): void => {
  localStorage.setItem(STORAGE_KEYS.GAME_ID, gameId);
};

// Get game ID from localStorage
export const getGameId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.GAME_ID);
};

// Save player ID to localStorage
export const savePlayerId = (playerId: string): void => {
  localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
};

// Get player ID from localStorage
export const getPlayerId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
};

// Save player name to localStorage
export const savePlayerName = (playerName: string): void => {
  localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
};

// Get player name from localStorage
export const getPlayerName = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
};

// Save game state to localStorage
export const saveGameState = (gameState: GameState): void => {
  localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
};

// Get game state from localStorage
export const getGameState = (): GameState | null => {
  const gameStateStr = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
  if (!gameStateStr) return null;
  
  try {
    return JSON.parse(gameStateStr) as GameState;
  } catch (error) {
    console.error('Error parsing game state from localStorage:', error);
    return null;
  }
};

// Save isGameStarted state to localStorage
export const saveIsGameStarted = (isStarted: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.IS_GAME_STARTED, isStarted ? 'true' : 'false');
};

// Get isGameStarted state from localStorage
export const getIsGameStarted = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_GAME_STARTED) === 'true';
};

// Save players to localStorage
export const savePlayers = (players: { id: string; name: string }[]): void => {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
};

// Get players from localStorage
export const getPlayers = (): { id: string; name: string }[] | null => {
  const playersStr = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  if (!playersStr) return null;
  
  try {
    return JSON.parse(playersStr) as { id: string; name: string }[];
  } catch (error) {
    console.error('Error parsing players from localStorage:', error);
    return null;
  }
};

// Clear all game data from localStorage
export const clearGameData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.GAME_ID);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
  localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  localStorage.removeItem(STORAGE_KEYS.IS_GAME_STARTED);
  localStorage.removeItem(STORAGE_KEYS.PLAYERS);
}; 