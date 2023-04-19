import { Scene } from 'phaser';

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
