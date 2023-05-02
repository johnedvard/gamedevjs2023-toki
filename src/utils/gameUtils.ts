import { Scene } from 'phaser';
import { playLockObject, playUnLockObject } from './soundUtils';
import { IGameObject } from '~/interfaces/IGameObject';

/**
 * Store the mapping between a game object, and it's parent
 */
const bodyTypeMap: { [key: number]: IGameObject } = {};

export const getCanvas = (): HTMLCanvasElement => {
  return document.querySelector('#moons-of-terra');
};

export const getCenter = (scene: Scene): Phaser.Math.Vector2 => {
  return new Phaser.Math.Vector2(scene.cameras.main.centerX, scene.cameras.main.centerY);
};

export const commonTimeLock = (body: MatterJS.BodyType) => {
  body.isStatic = !body.isStatic;
  if (body.isStatic) playLockObject();
  else playUnLockObject();
};

export const setBodyMapping = (body: MatterJS.BodyType, object: IGameObject) => {
  bodyTypeMap[body.id] = object;
};

export const getBodyMapping = (body: MatterJS.BodyType): IGameObject => {
  return bodyTypeMap[body.id];
};

/**
 * Need to set these properties to prevent the player from sliding on the object after making the platfor stattic
 */
export const stopCompletely = (scene: Scene, body: MatterJS.BodyType) => {
  if (!body) return;
  scene.matter.setAngularVelocity(body, 0);
  scene.matter.setVelocity(body, 0, 0);
};
