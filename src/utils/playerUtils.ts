import { Scene } from 'phaser';
import { Player } from '~/gameobjects/Player';

/**
 * Aim the weapon, but not farther out than the circle
 */
export const updateAim = (scene: Scene, aimBone: spine.Bone) => {
  if (!aimBone) return;
  let mouseX = scene.input.activePointer.worldX;
  let mouseY = -scene.input.activePointer.worldY + scene.cameras.main.height;

  let phaserMousePos = new Phaser.Math.Vector2(mouseX, mouseY);

  let localPos = aimBone.parent.worldToLocal(phaserMousePos);

  aimBone.x = localPos.x;
  aimBone.y = localPos.y;
};

export const startActionRoutine = (scene: Scene, startPos: Phaser.Math.Vector2, endPos: Phaser.Math.Vector2) => {
  const graphics = scene.add.graphics();
  const maxEllapsedTime = 230;
  let ellapsedTime = 0;
  const gameUpdateListener = (time: number, delta: number) => {
    ellapsedTime += delta;
    graphics.clear();
    graphics.lineStyle((maxEllapsedTime - ellapsedTime) / 100, 0xffff00, 1);
    graphics.moveTo(startPos.x, startPos.y);
    graphics.lineTo(endPos.x, endPos.y);
    graphics.stroke();
    if (ellapsedTime >= maxEllapsedTime) {
      graphics.clear();
      scene.events.off(Phaser.Scenes.Events.UPDATE, gameUpdateListener);
      return;
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, gameUpdateListener);
  return gameUpdateListener;
};
