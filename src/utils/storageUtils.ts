import { getGameState } from '~/gameState';
import { SaveGameState } from '~/types/SaveGameState';

const keyPrefix = 'toki-';
export const setItem = (key: string, value: string) => {
  try {
    localStorage.setItem(keyPrefix + key, value);
  } catch (err) {
    console.error(err);
  }
};

export const getItem = (key: string): string | null => {
  let res = null;
  try {
    res = localStorage.getItem(keyPrefix + key);
  } catch (err) {
    console.error(err);
  } finally {
    return res;
  }
};

export const saveGame = (): void => {
  const state: SaveGameState = getGameState();
  setItem('saveFile', JSON.stringify(state));
};

export const getSaveFile = () => {
  const saveFile = getItem('saveFile');
  if (!saveFile) return null;
  return JSON.parse(saveFile);
};
