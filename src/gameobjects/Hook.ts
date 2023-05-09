import { GameObjects, Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { IGameObject } from '~/interfaces/IGameObject';
import { off, on } from '~/utils/eventEmitterUtils';
import { commonTimeLock, stopCompletely } from '~/utils/gameUtils';
import { destroyObject } from '~/utils/gameobjectUtils';
import { playLockObject, playUnLockObject } from '~/utils/soundUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  pathToFollow?: Phaser.Curves.Path;
};
export class Hook implements IGameObject {
  body: MatterJS.BodyType;
  bodyConstraint: MatterJS.BodyType;
  constraint: MatterJS.ConstraintType;
  spineObject: SpineGameObject;
  pathToFollow: Phaser.Curves.Path;
  playerConstraint: MatterJS.ConstraintType;
  patrolTime = 500;
  timeAlive = 0;
  radius = 60;

  constructor(private scene: Scene, { pos, pathToFollow }: TProps) {
    this.timeAlive = (Math.PI / -2) * pathToFollow.getLength(); // set in order to start path from 0, and not 0.5
    this.pathToFollow = pathToFollow;
    this.createBody(pos);
    this.initSpineObject(pos);
    this.listenForEvents();
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.bodyConstraint = this.scene.matter.add.circle(startPosX + this.radius / 2, startPosY + this.radius / 2, 10, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.constraint,
    });

    this.body = this.scene.matter.add.circle(startPosX, startPosY, this.radius, {
      label: BodyTypeLabel.platform,
      friction: 1,
      mass: 10,
    });

    this.scene.matter.body.setInertia(this.body, Infinity); // prevent body from rotating

    this.body.onCollideCallback = ({ bodyA, bodyB }) => {
      if (bodyB.label === BodyTypeLabel.player && !this.body.isStatic && !this.playerConstraint) {
        this.playerConstraint = this.scene.matter.add.constraint(bodyB, this.bodyConstraint, 100, 0.05);
      }
    };

    this.constraint = this.scene.matter.add.constraint(this.body, this.bodyConstraint, 0, 1);
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'hook', 'idle', true).setDepth(DepthGroup.box).setScale(0.5);
  }

  followPath(time: number, delta: number) {
    if (this.body.isStatic || !this.playerConstraint) return;
    this.timeAlive += delta;
    // TODO (johnedvard) move to other file
    const s = 0.5 + 0.5 * Math.sin(this.timeAlive / this.pathToFollow.getLength());
    const p = this.pathToFollow.getPoint(s);
    this.bodyConstraint.position.x = p.x;
    this.bodyConstraint.position.y = p.y;
  }
  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
  }

  update(time: number, delta: number) {
    if (this.body.isStatic && this.playerConstraint) {
      this.scene.matter.world.removeConstraint(this.playerConstraint);
      this.playerConstraint = null;
    }
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
