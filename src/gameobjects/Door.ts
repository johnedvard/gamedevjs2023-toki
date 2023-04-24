import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { DoorState } from '~/types/DoorState';
import { emit, on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  goToLevelId: string;
  isGoal?: boolean;
};

export class Door {
  body: MatterJS.BodyType;
  goToLevelId: string;
  spineObject: SpineGameObject;
  isGoal: boolean;
  state: DoorState;
  constructor(private scene: Scene, { pos, goToLevelId, isGoal }: TProps) {
    this.isGoal = isGoal;
    this.goToLevelId = goToLevelId;
    this.createBody(pos);
    this.createSpineObject(pos);
    this.listenForEvents();
    this.setState(isGoal ? 'open' : 'locked');
  }
  private createBody(pos: Phaser.Math.Vector2) {
    this.body = this.scene.matter.add.circle(pos.x, pos.y, 100, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.proximity,
    });
  }
  setState(state: DoorState) {
    if (this.state === state) return;
    this.state = state;
    switch (state) {
      case 'open':
        break;
      case 'locked':
        break;
      default:
    }
  }
  createSpineObject(pos: Phaser.Math.Vector2) {
    let animationName = 'close';
    if (this.isGoal) animationName = 'open'; // the door in the tutorial level is al
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'door', animationName, true).setDepth(DepthGroup.door);
  }
  update(time: number, delta: number) {}
  openDoor = () => {
    const allObjectsInProximity = this.scene.matter.intersectBody(this.body);

    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      if (other.label === BodyTypeLabel.player) {
        if (this.state !== 'open') {
          this.spineObject.play('still-locked');
          return;
        } else {
          emit(GameEvent.goToLevel, { levelId: this.goToLevelId });
        }
      }
    }
  };

  private listenForEvents() {
    on(ControllerEvent.up, this.openDoor);
  }
}
