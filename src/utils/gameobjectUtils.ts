import { Scene } from 'phaser';
import { IGameObject } from '~/interfaces/IGameObject';

export const destroyObject = (scene: Scene, object: IGameObject) => {
  object.stopListeningForEvents();
  if (object.body) scene.matter.world.remove(object.body);
  object.body = null;
  if (object.spineObject) {
    object.spineObject.destroy();
    object.spineObject = null;
  }
};
