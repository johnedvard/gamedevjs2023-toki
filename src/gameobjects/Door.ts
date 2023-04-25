import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { getGameState, isLevelComplete } from '~/gameState';
import { DoorState } from '~/types/DoorState';
import { emit, on } from '~/utils/eventEmitterUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  goToLevelId: string;
  isGoal?: boolean;
  canUnlock?: boolean;
};

export class Door {
  body: MatterJS.BodyType;
  goToLevelId: string;
  spineObject: SpineGameObject;
  isGoal: boolean;
  isDoorUnlocked: boolean;
  canUnlock: boolean;
  state: DoorState;
  constructor(private scene: Scene, { pos, goToLevelId, isGoal, canUnlock }: TProps) {
    this.canUnlock = canUnlock;
    this.isGoal = isGoal;
    this.goToLevelId = goToLevelId;
    this.isDoorUnlocked = isGoal || isLevelComplete(goToLevelId);
    this.createBody(pos);
    this.createSpineObject(pos);
    this.listenForEvents();
    console.log('isDoorUnlocked', this.isDoorUnlocked, this.goToLevelId);
    this.setState(this.isDoorUnlocked ? 'open' : 'locked');
  }
  private createBody(pos: Phaser.Math.Vector2) {
    this.body = this.scene.matter.add.circle(pos.x, pos.y, 100, {
      isSensor: true,
      isStatic: true,
      label: BodyTypeLabel.proximity,
    });
    this.body.onCollideCallback = ({ bodyA, bodyB }) => {
      if (bodyB?.label === BodyTypeLabel.player && this.state === 'locked' && this.canUnlock) {
        this.setState('open');
        this.spineObject?.play('unlock');
      }
    };
  }
  setState(state: DoorState) {
    if (this.state === state) return;
    this.state = state;
    switch (state) {
      case 'open':
        this.spineObject.play('open');
        break;
      case 'locked':
        this.spineObject.play('close');
        break;
      default:
    }
  }
  createSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'door', 'close', true).setDepth(DepthGroup.door);
  }
  update(time: number, delta: number) {}
  openDoor = () => {
    const allObjectsInProximity = this.scene.matter.intersectBody(this.body);
    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      if (other.label === BodyTypeLabel.player) {
        // TODO (make proper game state debug tool)
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
