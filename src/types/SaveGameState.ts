export type SaveGameState = {
  levelState?: { [levelId: string]: number }; // number of time capsules captured for the level
};
