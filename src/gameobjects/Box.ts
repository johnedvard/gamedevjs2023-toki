import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { IGameObject } from '~/interfaces/IGameObject';
import { off, on } from '~/utils/eventEmitterUtils';
import { commonTimeLock, setBodyMapping, stopCompletely } from '~/utils/gameUtils';
import { destroyObject } from '~/utils/gameobjectUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  width: number;
  height: number;
};
export class Box implements IGameObject {
  body: MatterJS.BodyType;
  spineObject: SpineGameObject;
  width = 10;
  height = 10;

  constructor(private scene: Scene, { pos, width, height }: TProps) {
    this.height = height;
    this.width = width;
    this.createBody(pos);
    this.initSpineObject(pos);
    this.listenForEvents();
    setBodyMapping(this.body, this);
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width, this.height, {
      frictionAir: 0.05,
      friction: 0.5,
      label: BodyTypeLabel.box,
      mass: 5,
      restitution: 0,
    });
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'box', 'idle', true).setDepth(DepthGroup.box);
    const scale = this.width / this.spineObject.width;
    this.spineObject.setScale(scale - 0.07);
  }

  updateSpineObject() {
    if (!this.body) return;
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
    this.spineObject.rotation = this.body.angle;
  }

  update(time: number, delta: number) {
    this.updateSpineObject();
  }

  isGrabbable() {
    // TODO (johnedvard) Maybe prevent grabbing in certain situations
    return !this.body.isStatic;
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

  stopListeningForEvents = () => {
    off(GameEvent.timeLock, this.onTimeLock);
  };

  destroy() {
    destroyObject(this.scene, this);
  }
}
