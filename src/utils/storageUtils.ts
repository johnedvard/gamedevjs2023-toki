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

// TODO Create a type that matches your game state
export const saveFile = (saveFile): void => {
  setItem('saveFile', JSON.stringify(saveFile));
};

export const getSaveFile = () => {
  const saveFile = getItem('saveFile');
  if (!saveFile) return null;
  return JSON.parse(saveFile);
};
