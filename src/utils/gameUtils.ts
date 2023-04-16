import { Scene } from 'phaser';
import { getSaveFile } from './storageUtils';

export const getCanvas = (): HTMLCanvasElement => {
  return document.querySelector('#moons-of-terra');
};

export const hasSaveFile = (): boolean => {
  return Boolean(getSaveFile());
};

export const getCenter = (scene: Scene): Phaser.Math.Vector2 => {
  return new Phaser.Math.Vector2(scene.cameras.main.centerX, scene.cameras.main.centerY);
};
