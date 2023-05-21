import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { getGameState, isLevelComplete } from '~/gameState';
import { IGameObject } from '~/interfaces/IGameObject';
import { DoorState } from '~/types/DoorState';
import { emit, off, on } from '~/utils/eventEmitterUtils';
import { destroyObject } from '~/utils/gameobjectUtils';
import { playUnlockDoor } from '~/utils/soundUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
  goToLevelId: string;
  isGoal?: boolean;
  canUnlock?: boolean;
  numCapsules: number;
};

export class Door implements IGameObject {
  body: MatterJS.BodyType;
  goToLevelId: string;
  spineObject: SpineGameObject;
  timeCapsuesBitmap: Phaser.GameObjects.BitmapText;
  spineTimeCapsule: SpineGameObject;
  isGoal: boolean;
  numTimeCapsules: number;
  isDoorUnlocked: boolean;
  canUnlock: boolean;
  state: DoorState;
  numCapsules: number;
  collectedCapsules: number;

  constructor(private scene: Scene, { pos, goToLevelId, isGoal, canUnlock, numCapsules }: TProps) {
    this.numCapsules = numCapsules;
    this.canUnlock = canUnlock;
    this.isGoal = isGoal;
    this.goToLevelId = goToLevelId;
    this.isDoorUnlocked = isGoal || isLevelComplete(goToLevelId);
    this.createBody(pos);
    this.createSpineObject(pos);
    this.listenForEvents();
    this.setCollectedCapsules();
    this.createTimeCapsuleText(pos);
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
        playUnlockDoor();
      }
    };
  }
  createTimeCapsuleText(pos: Phaser.Math.Vector2) {
    if (this.isGoal) return;
    this.timeCapsuesBitmap = this.scene.add
      .bitmapText(pos.x - 20, pos.y - 120, 'atari', '', 32, 0)
      .setDepth(DepthGroup.door);
    this.timeCapsuesBitmap.setText(`${this.collectedCapsules || 0}/${this.numCapsules}`);
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
  setCollectedCapsules() {
    if (this.isGoal) return;
    const collectedCapsules = getGameState()[this.goToLevelId];
    if (collectedCapsules) this.collectedCapsules = collectedCapsules;
  }
  createSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'door', 'close', true).setDepth(DepthGroup.door);
    if (!this.isGoal) {
      this.spineTimeCapsule = this.scene.add
        .spine(pos.x - 50, pos.y - 100, 'timeCapsule')
        .setDepth(DepthGroup.door)
        .setScale(0.2);
    }
  }
  update(time: number, delta: number) {}
  openDoor = () => {
    if (!this.body) return;
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

  isGrabbable() {
    return false;
  }

  destroy() {
    if (this.spineTimeCapsule) {
      this.spineTimeCapsule.destroy();
      this.spineTimeCapsule = null;
    }
    if (this.timeCapsuesBitmap) {
      this.timeCapsuesBitmap.destroy();
    }
    destroyObject(this.scene, this);
  }

  stopListeningForEvents() {
    off(ControllerEvent.up, this.openDoor);
  }
  private listenForEvents() {
    on(ControllerEvent.up, this.openDoor);
  }
}
