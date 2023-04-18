import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';

import { DepthGroup } from '~/enums/DepthGroup';
import { PlayerState } from '~/types/PlayerState';
import { on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};
export class Player {
  body: MatterJS.BodyType;
  bodyRadius = 30;
  spineObject: SpineGameObject;
  spineOffset = new Phaser.Math.Vector2(0, 25);
  speed = 8;
  scale = 0.5;
  state: PlayerState;

  constructor(private scene: Scene, { pos }: TProps) {
    this.initSpineObject(pos);
    this.createBody(pos);
    this.listenForEvents();
  }

  initSpineObject = (pos: Phaser.Math.Vector2) => {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'hero', 'idle', true)
      .setDepth(DepthGroup.player)
      .setScale(this.scale);
    this.spineObject.timeScale = 1.3;
  };

  update(time: number, delta: number) {
    this.updateSpineObject();
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x + this.spineOffset.x, y + this.spineOffset.y);
  }

  setState(state: PlayerState) {
    if (this.state === state) return;
    switch (state) {
      case 'idle':
        this.spineObject.play('idle', true, true);
        break;
      case 'walk':
        this.spineObject.play('walk', true, true);
        break;
      default:
    }
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

  private setDirection(direction: number) {
    this.spineObject.scaleX = this.scale * direction;
  }
  private onControllerVelocity = ({ velocity }: { velocity: Phaser.Math.Vector2 }) => {
    if (velocity.x !== 0) {
      this.setState('walk');
      this.scene.matter.setVelocity(this.body, velocity.x * this.speed, 0);
      this.setDirection(velocity.x > 0 ? 1 : -1);
    } else {
      this.setState('idle');
    }
  };

  private listenForEvents() {
    on(ControllerEvent.velocity, this.onControllerVelocity);
  }
}
