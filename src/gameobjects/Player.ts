import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';

import { DepthGroup } from '~/enums/DepthGroup';
import { on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};
export class Player {
  body: MatterJS.BodyType;
  bodyRadius = 30;
  spineObject: SpineGameObject;
  spineOffset = new Phaser.Math.Vector2(0, 25);
  speed = 12;

  constructor(private scene: Scene, { pos }: TProps) {
    this.initSpineObject(pos);
    this.createBody(pos);
    this.listenForEvents();
  }

  initSpineObject = (pos: Phaser.Math.Vector2) => {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'hero', 'idle', true)
      .setDepth(DepthGroup.player)
      .setScale(0.5);
    this.spineObject.timeScale = 1.3;
  };

  update(time: number, delta: number) {
    this.updateSpineObject();
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x + this.spineOffset.x, y + this.spineOffset.y);
  }

  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;
    this.body = this.scene.matter.add.circle(startPosX, startPosY, this.bodyRadius, {
      frictionAir: 0.1,
      label: BodyTypeLabel.player,
      mass: 14,
    });
    this.body.onCollideActiveCallback = function () {
      // prevent the body from rotating when we collide, keeps the overHead point fixed
      this.angle = 0;
    };
  }

  private onControllerVelocity = ({ velocity }: { velocity: Phaser.Math.Vector2 }) => {
    if (velocity.x !== 0) {
      this.scene.matter.setVelocity(this.body, velocity.x * this.speed, 0);
    }
  };

  private listenForEvents() {
    on(ControllerEvent.velocity, this.onControllerVelocity);
  }
}
