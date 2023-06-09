import { GameObjects, Scene } from 'phaser';

import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { IGameObject } from '~/interfaces/IGameObject';
import { emit, off, on } from '~/utils/eventEmitterUtils';
import { commonTimeLock, stopCompletely } from '~/utils/gameUtils';
import { destroyObject } from '~/utils/gameobjectUtils';

type CollideCallback = {
  bodyA: MatterJS.BodyType;
  bodyB: MatterJS.BodyType;
};

type TProps = {
  pos: Phaser.Math.Vector2;
  width: number;
  height: number;
  pathToFollow?: Phaser.Curves.Path;
};

export class Platform implements IGameObject {
  body: MatterJS.BodyType;
  bodyConstraint: MatterJS.BodyType;
  constraint: MatterJS.ConstraintType;
  spineObject: SpineGameObject;
  width = 10;
  height = 10;
  pathToFollow: Phaser.Curves.Path;
  timeAlive = 0;

  constructor(private scene: Scene, { pos, width, height, pathToFollow }: TProps) {
    this.pathToFollow = pathToFollow;
    this.height = height;
    this.width = width;
    this.createBody(pos);
    this.initSpineObject(pos);
    this.listenForEvents();
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.bodyConstraint = this.scene.matter.add.circle(startPosX + this.width / 2, startPosY + this.height / 2, 10, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.constraint,
    });

    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width, this.height, {
      label: BodyTypeLabel.platform,
      friction: 1,
      frictionStatic: 1,
      restitution: 0,
      mass: 10,
    });

    this.body.onCollideActiveCallback = ({ bodyA, bodyB }: CollideCallback) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        emit(GameEvent.onPlatform, { body: bodyA });
      }
    };
    this.body.onCollideEndCallback = ({ bodyA, bodyB }: CollideCallback) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        emit(GameEvent.offPlatform, { body: null });
      }
    };
    this.body.onCollideCallback = ({ bodyA, bodyB }: CollideCallback) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        if (Math.abs(bodyB.speed) >= 20) {
          // TODO (johnedvard) Maybe change scale of object based on speed within inpact and add a bouncy-ish juicy effect
        }
      }
    };

    this.scene.matter.body.setInertia(this.body, Infinity); // prevent body from rotating

    this.constraint = this.scene.matter.add.constraint(this.body, this.bodyConstraint, 0, 1);
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'spinningBar', 'idle', true)
      .setDepth(DepthGroup.box)
      .setAngle(90);

    const unsafeBarSlot = this.spineObject.findSlot('unsafe-bar');
    unsafeBarSlot.setAttachment(null);
  }

  followPath(time: number, delta: number) {
    if (this.body.isStatic) return;
    this.timeAlive += delta;
    // TODO (johnedvard) move to other file
    const s = 0.5 + 0.5 * Math.sin(this.timeAlive / (1.5 * this.pathToFollow.getLength()));
    const p = this.pathToFollow.getPoint(s);
    this.bodyConstraint.position.x = p.x;
    this.bodyConstraint.position.y = p.y;
  }
  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
  }

  update(time: number, delta: number) {
    // this.scene.matter.setAngularVelocity(this.body, 0); // another way of preventing rotation
    this.followPath(time, delta);
    this.updateSpineObject();
  }

  isGrabbable() {
    return false;
  }

  onTimeLock = ({ body }: { body: MatterJS.BodyType }) => {
    if (body && body === this.body) {
      stopCompletely(this.scene, this.body);
      commonTimeLock(this.scene, this.body);
    }
  };

  listenForEvents = () => {
    on(GameEvent.timeLock, this.onTimeLock);
  };
  stopListeningForEvents() {
    off(GameEvent.timeLock, this.onTimeLock);
  }

  destroy() {
    if (this.bodyConstraint) {
      this.scene.matter.world.remove(this.bodyConstraint);
      this.bodyConstraint = null;
    }
    if (this.constraint) {
      this.scene.matter.world.removeConstraint(this.constraint, true);
      this.constraint = null;
    }
    destroyObject(this.scene, this);
  }
}
