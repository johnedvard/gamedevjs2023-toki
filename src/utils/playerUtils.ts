import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
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
  const maxEllapsedTime = 300;
  let ellapsedTime = 0;
  const gameUpdateListener = (time: number, delta: number) => {
    ellapsedTime += delta;
    graphics.clear();
    graphics.lineStyle((maxEllapsedTime - ellapsedTime) / 60, 0xffff00, 1);
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

/**
 *
 * @returns the closest object on the line that intersects with it. If no intersection is detected, return null
 */
export const getClosestBody = (
  scene: Scene,
  startPos: Phaser.Math.Vector2,
  endPos: Phaser.Math.Vector2
): MatterJS.BodyType | null => {
  const line = new Phaser.Geom.Line(startPos.x, startPos.y, endPos.x, endPos.y); // ray-cast
  var bodies = scene.matter.world
    .getAllBodies()
    .filter((b) => {
      return (
        b.label !== BodyTypeLabel.proximity && b.label !== BodyTypeLabel.player && b.label !== BodyTypeLabel.constraint
      );
    })
    .sort((a, b) => {
      const aPos = new Phaser.Math.Vector2(a.position.x, a.position.y);
      const bPos = new Phaser.Math.Vector2(b.position.x, b.position.y);
      const distanceAFromStart = aPos.subtract(startPos).length();
      const distanceBFromStart = bPos.subtract(startPos).length();
      return distanceAFromStart - distanceBFromStart;
    });

  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var vertices = body.vertices;

    // loop through all edges of the body and check if the line segment intersects with each edge
    for (var j = 0; j < vertices.length; j++) {
      var v1 = vertices[j];
      var v2 = vertices[(j + 1) % vertices.length];
      var intersection = Phaser.Geom.Intersects.LineToLine(line, new Phaser.Geom.Line(v1.x, v1.y, v2.x, v2.y));

      if (intersection) {
        return body;
      }
    }
  }
  return null;
};

/**
 * @returns the closest point on the line that intersects with an object. kIf no intersection is detected, return the original @see endPos
 */
export const getClosestEndPos = (
  body: MatterJS.BodyType,
  startPos: Phaser.Math.Vector2,
  endPos: Phaser.Math.Vector2,
  direction: Phaser.Math.Vector2
): Phaser.Math.Vector2 => {
  if (!body) return endPos;
  const distanceToBox = new Phaser.Math.Vector2(body.position.x - startPos.x, body.position.y - startPos.y).length();
  // return the point where the line intersects with an edge
  return new Phaser.Math.Vector2(direction.x * distanceToBox, direction.y * distanceToBox).add(startPos);
};

export const startKilledRoutine = (scene: Scene, { pos }: { pos: Phaser.Math.Vector2 }): Promise<boolean> => {
  const killEmitterTime = 300;
  const maxEllapsedTime = 1000;
  let ellapsedTime = 0;

  const emitter = scene.add.particles(0, 0, 'particle', {
    emitZone: { source: new Phaser.Geom.Circle(pos.x, pos.y, 10), type: 'random', quantity: 100 },
    lifespan: { min: 100, max: 500 },
    speedX: { min: -600, max: 600 },
    speedY: { min: -600, max: 600 },
    accelerationY: { random: [-100, 100] },
    accelerationX: { random: [-100, 100] },
    scale: { start: 1, end: 0.3 },
    alpha: { start: 0, end: 1, steps: 5 },
    frequency: 8,
  });
  emitter.start();

  return new Promise((resolve) => {
    const gameUpdateListener = (time: number, delta: number) => {
      ellapsedTime += delta;
      if (ellapsedTime >= killEmitterTime && emitter.active) {
        emitter.stop();
      }
      if (ellapsedTime >= maxEllapsedTime) {
        scene.events.off(Phaser.Scenes.Events.UPDATE, gameUpdateListener);
        resolve(true);
      }
    };
    scene.events.on(Phaser.Scenes.Events.UPDATE, gameUpdateListener);
  });
};
