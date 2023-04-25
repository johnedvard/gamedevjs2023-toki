import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { emit, on } from '~/utils/eventEmitterUtils';
import { playLockObject, playUnLockObject } from '~/utils/soundUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  width?: number;
  height?: number;
  isSafe?: boolean;
};

export class SpinningBar {
  body: MatterJS.BodyType;
  constraint: MatterJS.BodyType;
  spineObject: SpineGameObject;
  width = 90;
  height = 299;
  angle = 0;
  startPos;
  isSafe;
  constructor(private scene: Scene, { pos, width, height, isSafe }: TProps) {
    if (height) this.height = height;
    if (width) this.width = width;
    this.isSafe = isSafe;
    this.startPos = pos;

    this.createBody(pos);
    this.initSpineObject(pos);
    this.listenForEvents();
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;
    this.constraint = this.scene.matter.add.circle(startPosX, startPosY, 10, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.constraint,
    });
    // TODO, don't use body, but a regular rect, and check for collision within polygon, because bug with ignoreGravity
    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width - 30, this.height - 10, {
      label: BodyTypeLabel.spinningBar,
      isSensor: this.isSafe ? false : true,
      ignoreGravity: true, // doesn't work in phaser 3.60 https://github.com/photonstorm/phaser/issues/6473,
      density: 999,
      mass: 999,
    });
    const constraint = this.scene.matter.add.constraint(this.body, this.constraint, 0, 0.1);

    // Add the constraint to the Matter world
    this.scene.matter.world.add(constraint);

    if (!this.isSafe) {
      this.body.onCollideCallback = ({ bodyA, bodyB }) => {
        if (bodyB?.label === BodyTypeLabel.player) {
          emit(GameEvent.kill, { body: bodyB });
        }
      };
    }
  }

  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'spinningBar')
      .setDepth(DepthGroup.spinningBar)
      .setOffset(0, 0);
    const scale = 1;
    this.spineObject.setScale(scale);
    if (this.isSafe) {
      const unsafeBarSlot = this.spineObject.findSlot('unsafe-bar');
      unsafeBarSlot.setAttachment(null);
    }
  }

  lastAngleUpdateTime = 0;
  angleUpdateInterval = 10; // upd

  updateSpineObject(time: number) {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
    const elapsedFrames = Math.floor((time - this.lastAngleUpdateTime) / this.angleUpdateInterval);
    if (elapsedFrames > 0) {
      this.scene.matter.setAngularVelocity(this.body, 0.1);
      this.lastAngleUpdateTime = time;
      this.spineObject.rotation = this.body.angle;
    }
  }

  update(time: number, delta: number) {
    this.angle = this.angle + delta / 800;

    this.updateSpineObject(time);
  }

  onTimeLock = ({ body }: { body: MatterJS.BodyType }) => {
    if (body === this.body) {
      this.body.isStatic = !this.body.isStatic;
      if (this.body.isStatic) playLockObject();
      else playUnLockObject();
    }
  };
  listenForEvents = () => {
    on(GameEvent.timeLock, this.onTimeLock);
  };
}
