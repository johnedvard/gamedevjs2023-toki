import { Scene } from 'phaser';
import { playLockObject, playUnLockObject } from './soundUtils';

export const getCanvas = (): HTMLCanvasElement => {
  return document.querySelector('#moons-of-terra');
};

export const getCenter = (scene: Scene): Phaser.Math.Vector2 => {
  return new Phaser.Math.Vector2(scene.cameras.main.centerX, scene.cameras.main.centerY);
};

export const commonTimeLock = (other: MatterJS.BodyType, source: MatterJS.BodyType) => {
  if (other && other === source) {
    source.isStatic = !source.isStatic;
    if (source.isStatic) playLockObject();
    else playUnLockObject();
  }
};
