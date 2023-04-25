/**
 * state of level when it's created
 */
export type LevelState = {
  start: Phaser.Math.Vector2;
  totalCapsules?: number;
  levelId?: string;
};
