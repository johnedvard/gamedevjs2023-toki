import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { emit, on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};
export class StoreBooth {
  body: MatterJS.BodyType;
  spineObject: SpineGameObject;
  width = 246;
  height = 299;

  constructor(private scene: Scene, { pos }: TProps) {
    this.createBody(pos);
    this.initSpineObject(pos);
    this.listenForEvents();
  }
  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.body = this.scene.matter.add.rectangle(startPosX, startPosY, this.width - 1, this.height - 1, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.store,
    });
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'storeBooth', 'idle', true).setDepth(DepthGroup.store);
  }

  private onOpenStore = () => {
    const allObjectsInProximity = this.scene.matter.intersectBody(this.body);
    console.log('got event', allObjectsInProximity);
    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      if (other.label === BodyTypeLabel.player) {
        emit(GameEvent.openStore);
      }
    }
  };

  private listenForEvents() {
    on(ControllerEvent.up, this.onOpenStore);
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x, y);
  }

  update(time: number, delta: number) {
    this.updateSpineObject();
  }
}
