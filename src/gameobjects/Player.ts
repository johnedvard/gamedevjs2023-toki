import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';

import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { getEquippedSkinName } from '~/near/nearConnection';
import { PlayerState } from '~/types/PlayerState';
import { emit, off, on } from '~/utils/eventEmitterUtils';
import {
  getClosestBody,
  getClosestEndPos,
  startActionRoutine,
  startKilledRoutine,
  updateAim,
} from '~/utils/playerUtils';
import { SpeechBubble } from './SpeechBubble';
import { playDeadSound, playLaserBeam } from '~/utils/soundUtils';
import { SceneKey } from '~/enums/SceneKey';
import { IGameObject } from '~/interfaces/IGameObject';
import { destroyObject } from '~/utils/gameobjectUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};
export class Player implements IGameObject {
  body: MatterJS.BodyType;
  proximityCircle: MatterJS.BodyType;
  bodyRadius = 35;
  container: Phaser.GameObjects.Container; // used for camera to follow
  spineObject: SpineGameObject;
  spineOffset = new Phaser.Math.Vector2(0, 25);
  speed = 8;
  scale = 0.5;
  state: PlayerState;
  direction = 1;
  aimConstraintBone: spine.Bone;
  weaponBone: spine.Bone;
  aimBeamDistance = 500;
  startPos: Phaser.Math.Vector2;
  bubble: SpeechBubble;
  attachedToPlatform: MatterJS.BodyType;

  constructor(private scene: Scene, { pos }: TProps) {
    this.startPos = pos;
    this.initSpineObject(pos);
    this.createBody(pos);
    this.listenForEvents();
    this.cameraFollow();
  }

  initSpineObject = (pos: Phaser.Math.Vector2) => {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'hero', 'idle', true)
      .setDepth(DepthGroup.player)
      .setScale(this.scale)
      .setSkinByName('blue');

    this.spineObject.timeScale = 1.3;
    const skeleton = this.spineObject.skeleton;
    this.aimConstraintBone = skeleton.findBone('weapon-aim');
    this.weaponBone = skeleton.findBone('weapon-ik');
    this.spineObject.setSkinByName(getEquippedSkinName());
  };

  update(time: number, delta: number) {
    // this.scene.matter.setAngularVelocity(this.body, 0); another method to prevent rotation
    if (this.state === 'idle') {
      this.addVelocityToBody();
    }
    this.updateSpineObject();
    this.updateProximityCircle();
    this.updateContainer();
    this.bubble?.update(time, delta);

    updateAim(this.scene, this.aimConstraintBone);
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x + this.spineOffset.x, y + this.spineOffset.y);
  }

  setState(state: PlayerState) {
    if (!this.spineObject) return;
    if (this.state === state) return;
    this.state = state;
    switch (state) {
      case 'idle':
        this.spineObject.play('idle', true, true);
        break;
      case 'walk':
        this.spineObject.play('walk', true, true);
        break;
      case 'killed':
        this.playDead();
        break;
      default:
    }
  }

  destroy() {
    destroyObject(this.scene, this);
  }

  private cameraFollow() {
    this.scene.cameras.main.startFollow(this.container, false, 0.1, 0.1);
    this.scene.cameras.main.setZoom(1);
    this.scene.cameras.main.setDeadzone(400, 200);
  }

  private isOnGround() {
    const allObjectsInProximity = this.scene.matter.intersectBody(this.proximityCircle);
    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      // TODO (johnedvard) Improve check to be less manual labor
      if (
        other.label === BodyTypeLabel.collisionWall ||
        other.label === BodyTypeLabel.box ||
        other.label === BodyTypeLabel.spinningBar ||
        other.label === BodyTypeLabel.platform
      )
        return true;
    }

    return false;
  }

  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.body = this.scene.matter.add.circle(startPosX, startPosY, this.bodyRadius, {
      frictionAir: 0.05,
      label: BodyTypeLabel.player,
      mass: 10,
      friction: 1,
      frictionStatic: 0,
      restitution: 0,
    });
    this.scene.matter.body.setInertia(this.body, Infinity); // prevent body from rotating

    this.proximityCircle = this.scene.matter.add.circle(startPosX, startPosY, this.bodyRadius + 15, {
      isSensor: true,
      label: BodyTypeLabel.proximity,
    });

    this.container = this.scene.add.container(startPosX, startPosY, []);
  }

  private updateContainer() {
    const { x, y } = this.body.position;
    this.container.setX(x);
    this.container.setY(y);
  }
  private updateProximityCircle() {
    const { x, y } = this.body.position;
    this.scene.matter.body.setPosition(this.proximityCircle, new Phaser.Math.Vector2(x, y), false);
  }

  private setDirection(direction: number) {
    if (!this.spineObject) return;
    if (direction === this.direction) return;
    this.spineObject.setScale(this.scale * direction, this.spineObject.scaleY);
    this.direction = direction;
  }

  private onMove = ({ velocity }: { velocity: Phaser.Math.Vector2 }) => {
    if (this.state === 'killed') return;
    if (velocity.x !== 0) {
      this.setState('walk');
      let velocityX = velocity.x * this.speed;

      // TODO (johnedvard) also check if actually on top of platform (not below or on the sides)
      if (this.attachedToPlatform) {
        const velocityMultiplier =
          Math.sign(this.attachedToPlatform.velocity.x) == Math.sign(this.body.velocity.x) ? 0.5 : 1.5;
        velocityX += this.attachedToPlatform.velocity.x * velocityMultiplier;
      }
      this.scene.matter.setVelocity(this.body, velocityX, this.body.velocity.y);
      this.setDirection(velocity.x > 0 ? 1 : -1);
    } else {
      this.setState('idle');
    }
  };

  private onJump = () => {
    if (!this.isOnGround() || this.state === 'killed') return;
    this.scene.matter.setVelocity(this.body, this.body.velocity.x, -30);
    this.setState('jump');
  };

  private onAction = ({ pos }: { pos: Phaser.Math.Vector2 }) => {
    if (!this.scene.game.scene.isActive(SceneKey.Level)) return; // don't do action if scene is paused
    const x = this.weaponBone.worldX + this.scene.cameras.main.scrollX;
    const y = -this.weaponBone.worldY + this.scene.cameras.main.height + this.scene.cameras.main.scrollY; // spine y coordinates are opposite of Phaser's

    // Make up for scrollX and scrollY since the InputScene doesn't support that
    const aimedPos = new Phaser.Math.Vector2(
      pos.x + this.scene.cameras.main.scrollX,
      pos.y + this.scene.cameras.main.scrollY
    );
    const startPos = new Phaser.Math.Vector2(x, y);
    const maxDist = this.aimBeamDistance;
    const direction = aimedPos.clone().subtract(startPos).normalize();
    let endPos = new Phaser.Math.Vector2(direction.x * maxDist, direction.y * maxDist).add(startPos);

    const closestBody = getClosestBody(this.scene, startPos, endPos);

    emit(GameEvent.timeLock, { body: closestBody });
    playLaserBeam();

    // TODO (johnedvard) Add some particle effects to the endPos if we found a body
    endPos = getClosestEndPos(closestBody, startPos, endPos, direction);

    startActionRoutine(this.scene, startPos, endPos);
  };

  private onSkinChanged = ({ skinName }: { skinName: string }) => {
    if (skinName) this.spineObject.setSkinByName(skinName);
  };

  async playDead() {
    this.spineObject.play('killed');
    this.body.isStatic = true;
    this.body.isSensor = true;
    playDeadSound();
    await startKilledRoutine(this.scene, { pos: new Phaser.Math.Vector2(this.body.position.x, this.body.position.y) });
    emit(GameEvent.restartLevel);
  }

  addVelocityToBody() {
    // TODO (johnedavrd) Only add velocity to body (player) if it's above the platform
    if (this.attachedToPlatform) {
      this.scene.matter.setVelocityX(this.body, this.attachedToPlatform.velocity.x); // make player follow moving platform
    }
  }

  onKilled = async () => {
    this.setState('killed');
  };

  onAttachedTo = ({ body }) => {
    this.attachedToPlatform = body;
  };

  private listenForEvents() {
    // TODO (johnedvard) handle player input events in a different file
    on(ControllerEvent.move, this.onMove);
    on(ControllerEvent.jump, this.onJump);
    on(ControllerEvent.action, this.onAction);
    on(GameEvent.changeSkin, this.onSkinChanged);
    on(GameEvent.kill, this.onKilled);
    on(GameEvent.onPlatform, this.onAttachedTo);
    on(GameEvent.offPlatform, this.onAttachedTo);
  }
  stopListeningForEvents() {
    off(ControllerEvent.move, this.onMove);
    off(ControllerEvent.jump, this.onJump);
    off(ControllerEvent.action, this.onAction);
    off(GameEvent.changeSkin, this.onSkinChanged);
    off(GameEvent.kill, this.onKilled);
    off(GameEvent.onPlatform, this.onAttachedTo);
    off(GameEvent.offPlatform, this.onAttachedTo);
  }
}
