import { SaveGameState } from './types/SaveGameState';

const savedGameState: SaveGameState = null;
const gameState: SaveGameState = null;

export const getGameState = (): SaveGameState => {
  return { levelState: {} };
};
