import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  width: number;
  height: number;
};
export class Box {
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
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width - 1, this.height - 1, {
      frictionAir: 0.05,
      friction: 0.5,
      label: BodyTypeLabel.box,
      mass: 10,
    });
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'box', 'idle', true).setDepth(DepthGroup.box);
    const scale = this.width / this.spineObject.width;
    this.spineObject.setScale(scale);
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
    this.spineObject.rotation = this.body.angle;
  }

  update(time: number, delta: number) {
    this.updateSpineObject();
  }

  onTimeLock = ({ body }: { body: MatterJS.BodyType }) => {
    if (body === this.body) {
      this.body.isStatic = !this.body.isStatic;
      const attachment: spine.Attachment = this.spineObject.getAttachmentByName('SpinningBar', 'SpinningBar');
    }
  };
  listenForEvents = () => {
    on(GameEvent.timeLock, this.onTimeLock);
  };
}
