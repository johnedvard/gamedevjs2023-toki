import { GameObjects, Scene } from 'phaser';

/**
 * Aim the weapon, but not farther out than the circle
 */
export const updateAim = (scene: Scene, body: MatterJS.BodyType, radius: number, aimBone: spine.Bone) => {
  let mouseX = scene.input.activePointer.worldX - scene.cameras.main.scrollX;
  let mouseY = scene.cameras.main.scrollY - scene.input.activePointer.worldY + scene.cameras.main.height;

  let phaserMousePos = new Phaser.Math.Vector2(mouseX, mouseY);

  let localPos = aimBone.parent.worldToLocal(phaserMousePos);

  const vecA = new Phaser.Math.Vector2(
    body.position.x - scene.input.activePointer.worldX,
    body.position.y - scene.input.activePointer.worldY
  );

  if (radius < vecA.length()) {
    // TODO (johnedvard) figure out where the bug is. Draw the vectors in the screen to debug
    const ratio = radius / vecA.length();
    const point = new Phaser.Math.Vector2(localPos.x * ratio, localPos.y * ratio);
    localPos = new Phaser.Math.Vector2(point.x, point.y);
  }

  aimBone.x = localPos.x;
  aimBone.y = localPos.y;

  // aimBone.x = mouseX;
  // aimBone.y = mouseY;
};
