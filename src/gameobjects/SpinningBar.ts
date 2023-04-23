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
  startPos;
  constructor(private scene: Scene, { pos, width, height }: TProps) {
    if (height) this.height = height;
    if (width) this.width = width;
    this.startPos = pos;

    this.createBody(pos);
    this.initSpineObject(pos);
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    // TODO, don't use body, but a regular rect, and check for collision within polygon, because bug with ignoreGravity
    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width - 30, this.height - 10, {
      label: BodyTypeLabel.spinningBar,
      isSensor: true,
      ignoreGravity: true, // doesn't work in phaser 3.60 https://github.com/photonstorm/phaser/issues/6473,
    });

    this.body.onCollideCallback = ({ bodyA, bodyB }) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        console.log('kill');
      }
    };
  }

  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'spinningBar')
      .setDepth(DepthGroup.spinningBar)
      .setOffset(0, 0);
    const scale = 1;
    this.spineObject.setScale(scale);
  }

  lastAngleUpdateTime = 0;
  angleUpdateInterval = 10; // upd

  updateSpineObject(time: number) {
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
}
