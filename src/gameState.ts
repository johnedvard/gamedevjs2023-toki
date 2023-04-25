import { SaveGameState } from './types/SaveGameState';
import { SaveLevelState } from './types/SaveLevelState';
import { getItem, setItem } from './utils/storageUtils';

let gameState: SaveGameState = {}; // state while playing the game
let isGameLoaded = false;

export const getGameState = (): SaveGameState => {
  return gameState;
};

export const loadGame = (): SaveGameState => {
  if (isGameLoaded) return gameState; // return the current game state if game was already loaded
  const saveFileString = getItem('saveFile');
  isGameLoaded = true;
  if (saveFileString) {
    gameState = JSON.parse(saveFileString);
  }
  return gameState;
};

/**
 * Update the savedGameState with the current game state and store to localStorage
 */
const saveGame = (): void => {
  setItem('saveFile', JSON.stringify(gameState));
};

export const saveLevelComplete = ({ levelId, collectedCapsules }: SaveLevelState) => {
  gameState[levelId] = collectedCapsules;
  saveGame();
};

export const getSaveFile = () => {
  const saveFile = getItem('saveFile');
  if (!saveFile) return null;
  return JSON.parse(saveFile);
};

export const hasSaveFile = (): boolean => {
  if (!isGameLoaded) loadGame();
  return Object.keys(gameState).length > 0;
};

export const isLevelComplete = (levelId: string) => {
  return Boolean(gameState[levelId] >= 0);
};
