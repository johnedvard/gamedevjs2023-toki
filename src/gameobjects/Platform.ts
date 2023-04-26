import { GameObjects, Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { on } from '~/utils/eventEmitterUtils';
import { playLockObject, playUnLockObject } from '~/utils/soundUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  width: number;
  height: number;
  pathToFollow?: Phaser.Curves.Path;
};
export class Platform {
  body: MatterJS.BodyType;
  constraint: MatterJS.BodyType;
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

    this.constraint = this.scene.matter.add.circle(startPosX + this.width / 2, startPosY + this.height / 2, 10, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.constraint,
    });

    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width, this.height, {
      label: BodyTypeLabel.platform,
      friction: 1,
      mass: 10,
    });

    this.scene.matter.body.setInertia(this.body, Infinity); // prevent body from rotating

    const constraint = this.scene.matter.add.constraint(this.body, this.constraint, 0, 1);
    this.scene.matter.world.add(constraint);
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
    const s = 0.5 + 0.5 * Math.sin(this.timeAlive / (700 * this.followPath.length));
    const p = this.pathToFollow.getPoint(s);
    this.constraint.position.x = p.x;
    this.constraint.position.y = p.y;
  }
  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
  }

  update(time: number, delta: number) {
    this.followPath(time, delta);
    this.updateSpineObject();
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
