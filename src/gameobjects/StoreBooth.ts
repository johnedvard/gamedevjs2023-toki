import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { IGameObject } from '~/interfaces/IGameObject';
import { emit, off, on } from '~/utils/eventEmitterUtils';
import { destroyObject } from '~/utils/gameobjectUtils';
import { playStoreSound } from '~/utils/soundUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};

export class StoreBooth implements IGameObject {
  body: MatterJS.BodyType;
  spineObject: SpineGameObject;
  overlordSpine: SpineGameObject;
  speechBubble: SpineGameObject;
  overlordOffset = new Phaser.Math.Vector2(90, 0);
  speechBubbleOffset = new Phaser.Math.Vector2(-60, -220);
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
    this.body.onCollideCallback = ({ bodyA, bodyB }) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        this.speechBubble.play('idle', true, true);
      }
    };
    this.body.onCollideEndCallback = ({ bodyA, bodyB }) => {
      if (bodyB?.label === BodyTypeLabel.player) {
        this.speechBubble.play('hidden', true, true);
      }
    };
  }
  private initSpineObject(pos: Phaser.Math.Vector2) {
    this.spineObject = this.scene.add.spine(pos.x, pos.y, 'storeBooth', 'idle', true).setDepth(DepthGroup.store);
    this.overlordSpine = this.scene.add
      .spine(pos.x + this.overlordOffset.x, pos.y, 'overlord', 'idle', true)
      .setDepth(DepthGroup.store)
      .setScale(0.25);
    this.speechBubble = this.scene.add
      .spine(pos.x + this.speechBubbleOffset.x, pos.y + this.speechBubbleOffset.y, 'storeSpeechBubble', 'hidden', true)
      .setDepth(DepthGroup.store);
  }

  private onOpenStore = () => {
    if (!this.body) return;
    const allObjectsInProximity = this.scene.matter.intersectBody(this.body);

    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      if (other.label === BodyTypeLabel.player) {
        playStoreSound();
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

  isGrabbable() {
    return false;
  }

  stopListeningForEvents() {
    off(ControllerEvent.up, this.onOpenStore);
  }

  destroy() {
    destroyObject(this.scene, this);
    if (this.speechBubble) this.speechBubble.destroy();
    if (this.overlordSpine) this.overlordSpine.destroy();
    this.spineObject = null;
    this.overlordSpine = null;
    this.speechBubble = null;
  }
}
