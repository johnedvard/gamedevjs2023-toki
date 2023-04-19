import { Scene } from 'phaser';
import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { ControllerEvent } from '~/enums/ControllerEvent';

import { DepthGroup } from '~/enums/DepthGroup';
import { PlayerState } from '~/types/PlayerState';
import { on } from '~/utils/eventEmitterUtils';
import { startActionRoutine, updateAim } from '~/utils/playerUtils';

type TProps = {
  pos: Phaser.Math.Vector2;
};
export class Player {
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
  aimBeamDistance = 500;

  constructor(private scene: Scene, { pos }: TProps) {
    this.initSpineObject(pos);
    this.createBody(pos);
    this.listenForEvents();
    this.cameraFollow();
  }

  initSpineObject = (pos: Phaser.Math.Vector2) => {
    this.spineObject = this.scene.add
      .spine(pos.x, pos.y, 'hero', 'idle', true)
      .setDepth(DepthGroup.player)
      .setScale(this.scale);

    this.spineObject.timeScale = 1.3;
    this.aimConstraintBone = this.getAimConstraintBone();
  };

  update(time: number, delta: number) {
    this.updateSpineObject();
    this.updateProximityCircle();
    this.updateContainer();

    updateAim(this.scene, this.aimConstraintBone);
  }

  updateSpineObject() {
    const { x, y } = this.body.position;
    this.spineObject.setPosition(x + this.spineOffset.x, y + this.spineOffset.y);
  }

  setState(state: PlayerState) {
    if (this.state === state) return;
    switch (state) {
      case 'idle':
        this.spineObject.play('idle', true, true);
        break;
      case 'walk':
        this.spineObject.play('walk', true, true);
        break;
      default:
    }
  }

  private cameraFollow() {
    this.scene.cameras.main.startFollow(this.container, false, 0.1, 0.1);
    this.scene.cameras.main.setZoom(1);
    this.scene.cameras.main.setDeadzone(400, 200);
  }

  private getAimConstraintBone(): spine.Bone {
    const skeleton = this.spineObject.skeleton;
    return skeleton.findBone('weapon-aim');
  }

  private isOnGround() {
    const allObjectsInProximity = this.scene.matter.intersectBody(this.proximityCircle);
    for (let obj of allObjectsInProximity) {
      const other = <MatterJS.BodyType>obj;
      if (other.label === BodyTypeLabel.collisionWall || other.label === BodyTypeLabel.box) return true;
    }

    return false;
  }

  private createBody(pos: Phaser.Math.Vector2) {
    const startPosX = pos.x;
    const startPosY = pos.y;

    this.body = this.scene.matter.add.circle(startPosX, startPosY, this.bodyRadius, {
      frictionAir: 0.1,
      label: BodyTypeLabel.player,
      mass: 10,
      friction: 0.5,
    });

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
    if (direction === this.direction) return;
    this.spineObject.setScale(this.scale * direction, this.spineObject.scaleY);
    this.direction = direction;
  }

  private onMove = ({ velocity }: { velocity: Phaser.Math.Vector2 }) => {
    if (velocity.x !== 0) {
      this.setState('walk');
      this.scene.matter.setVelocity(this.body, velocity.x * this.speed, this.body.velocity.y);
      this.setDirection(velocity.x > 0 ? 1 : -1);
    } else {
      this.setState('idle');
    }
  };

  private onJump = () => {
    if (!this.isOnGround()) return;
    this.scene.matter.setVelocity(this.body, this.body.velocity.x, -30);
    this.setState('jump');
  };

  private onAction = ({ pos }: { pos: Phaser.Math.Vector2 }) => {
    const { x, y } = this.body.position;

    // Make up for scrollX and scrollY since input scene doesn't support that
    const aimedPos = new Phaser.Math.Vector2(
      pos.x + this.scene.cameras.main.scrollX,
      pos.y + this.scene.cameras.main.scrollY
    );
    const startPos = new Phaser.Math.Vector2(x, y);
    const direction = aimedPos.clone().subtract(startPos).normalize();
    const maxDist = this.aimBeamDistance;
    let endPos = new Phaser.Math.Vector2(direction.x * maxDist, direction.y * maxDist).add(startPos);

    const line = new Phaser.Geom.Line(startPos.x, startPos.y, endPos.x, endPos.y);
    // TODO sort bodies closest to the player first
    var bodies = this.scene.matter.world.getAllBodies().filter((b) => {
      return b.label !== BodyTypeLabel.proximity && b.label !== BodyTypeLabel.player;
    });

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      var vertices = body.vertices;

      // loop through all edges of the body and check if the line segment intersects with each edge
      for (var j = 0; j < vertices.length; j++) {
        var v1 = vertices[j];
        var v2 = vertices[(j + 1) % vertices.length];
        var intersection = Phaser.Geom.Intersects.LineToLine(line, new Phaser.Geom.Line(v1.x, v1.y, v2.x, v2.y));

        if (intersection) {
          const distanceToBox = new Phaser.Math.Vector2(
            body.position.x - startPos.x,
            body.position.y - startPos.y
          ).length();

          endPos = new Phaser.Math.Vector2(direction.x * distanceToBox, direction.y * distanceToBox).add(startPos);
          // TODO improve stasis
          body.isStatic = true;
          break;
        }
      }
    }
    startActionRoutine(this.scene, startPos, endPos);
  };

  private listenForEvents() {
    // TODO (johnedvard) handle player input events in a different file
    on(ControllerEvent.move, this.onMove);
    on(ControllerEvent.jump, this.onJump);
    on(ControllerEvent.action, this.onAction);
  }
}
