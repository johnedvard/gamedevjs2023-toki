import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';

type TProps = {
  pos: Phaser.Math.Vector2;
  width?: number;
  height?: number;
};

export class SpinningBar {
  body: MatterJS.BodyType;
  spineObject: SpineGameObject;
  width = 90;
  height = 299;
  angle = 0;
  constructor(private scene: Scene, { pos, width, height }: TProps) {
    if (height) this.height = height;
    if (width) this.width = width;

    this.createBody(pos);
    this.initSpineObject(pos);
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    // TODO, don't use body, but a regular rect, and check for collision within polygon
    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width - 1, this.height - 1, {
      label: BodyTypeLabel.spinningBar,
      ignoreGravity: true,
    });
  }

  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'spinningBar', 'idle', true).setDepth(DepthGroup.spinningBar);
    const scale = 1;
    this.spineObject.setScale(scale);
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
    this.spineObject.rotation = this.body.angle;
  }

  update(time: number, delta: number) {
    this.updateSpineObject();
    this.angle = 45;
    this.body.angle = this.angle;
  }
}
