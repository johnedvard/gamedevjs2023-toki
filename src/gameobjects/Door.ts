import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { GameEvent } from '~/enums/GameEvent';
import { emit, on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  goToLevelId: string;
};

export class Door {
  body: MatterJS.BodyType;
  goToLevelId: string;

  constructor(private scene: Scene, { pos, goToLevelId }: TProps) {
    this.goToLevelId = goToLevelId;
    this.createBody(pos);
    this.listenForEvents();
  }
  private createBody(pos: Phaser.Math.Vector2) {
    this.body = this.scene.matter.add.circle(pos.x, pos.y, 100, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.proximity,
    });
  }
  update(time: number, delta: number) {}
  openDoor = () => {
    const allObjectsInProximity = this.scene.matter.intersectBody(this.body);

    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      if (other.label === BodyTypeLabel.player) {
        emit(GameEvent.goToLevel, { levelId: this.goToLevelId });
      }
    }
  };

  private listenForEvents() {
    on(ControllerEvent.up, this.openDoor);
  }
}
