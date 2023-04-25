import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { TimeCapsuleState } from '~/types/TimeCapsuleState';
import { emit } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};

export class TimeCapsule {
  body: MatterJS.BodyType;
  spineObject: SpineGameObject;
  state: TimeCapsuleState;
  constructor(private scene: Scene, { pos }: TProps) {
    this.createBody(pos);
    this.initSpineObject(pos);
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, 226, 171, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.timeCapsule,
    });

    this.body.onCollideCallback = ({ bodyA, bodyB }) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        this.setState('collected');
      }
    };
  }
  setState(state: TimeCapsuleState) {
    if (this.state === state) return;
    this.state = state;
    switch (state) {
      case 'collected':
        this.spineObject.play('collected');
        this.spineObject.on('animationcomplete', () => {
          if (this.state === 'collected') this.scene.matter.world.remove(this.body);
        });
        emit(GameEvent.collectTimeCapsule);
        break;
      default:
        break;
    }
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'timeCapsule', 'idle', true)
      .setDepth(DepthGroup.store)
      .setScale(0.25);
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
  }

  update(time: number, delta: number) {
    this.updateSpineObject();
  }
}
