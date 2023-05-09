import { Scene } from 'phaser';
import { ChainImageState } from '~/types/ChainImageState';

/**
 * Used in a pool for the @see StasisChain
 */
export class ChainImage extends Phaser.GameObjects.Image {
  lifeTime = 500;
  maxLifeTime = 500;
  unitLength = 60;
  preDelay = 10; // adding on average 1 chain per frame
  ellapsedDelayTime = 0;
  chainState: ChainImageState = 'inactive';
  isLockAnimation = true;
  originPos: Phaser.Math.Vector2;

  constructor(scene: Scene) {
    super(scene, 0, 0, 'chain');
    this.setTint(0x313343);
  }

  private playAnimation(startPos: Phaser.Math.Vector2, endPos: Phaser.Math.Vector2, index: number) {
    this.setActive(true);
    this.setVisible(false);
    const angle = Phaser.Math.Angle.Between(startPos.x, startPos.y, endPos.x, endPos.y);
    this.setRotation(angle);
    this.setScale(0.25);
    this.setPosition(
      startPos.x + this.unitLength * index * Math.cos(angle),
      startPos.y + this.unitLength * index * Math.sin(angle)
    );
    this.setActive(true);
    this.setVisible(false);
    this.setChainState('predelay');
  }

  lockAnimation(startPos: Phaser.Math.Vector2, endPos: Phaser.Math.Vector2, index: number, totalChainUnits: number) {
    if (!startPos || !endPos) return;
    this.isLockAnimation = true;
    this.preDelay = this.preDelay * (totalChainUnits - index);

    this.playAnimation(startPos, endPos, index);
  }

  unlockAnimation(startPos: Phaser.Math.Vector2, endPos: Phaser.Math.Vector2, index: number) {
    if (!startPos || !endPos) return;
    this.isLockAnimation = false;
    this.playAnimation(startPos, endPos, index);
  }

  setChainState(state: ChainImageState) {
    if (this.chainState === state) return;
    this.chainState = state;
    switch (state) {
      case 'started':
        this.setActive(true);
        this.setVisible(true);
        break;
      case 'ended':
        this.setActive(false);
        this.setVisible(false);
        break;
    }
  }

  // Used for the chain to know in which direction it should move
  setOriginPos(pos: Phaser.Math.Vector2) {
    this.originPos = pos;
  }

  update(time: number, delta: number) {
    if (this.chainState === 'inactive' || this.chainState === 'ended') return;
    if (this.chainState === 'predelay') {
      this.ellapsedDelayTime += delta;
      if (this.ellapsedDelayTime >= this.preDelay) this.setChainState('started');
      return;
    }

    this.lifeTime -= delta;
    if (this.lifeTime <= this.maxLifeTime - 250) {
      this.setAlpha(this.lifeTime / (this.maxLifeTime - 250));
    }
    if (this.lifeTime <= 0) {
      this.setChainState('ended');
    }
    if (!this.isLockAnimation) {
      this.updateUnlock(time, delta);
    }
  }

  updateUnlock(time: number, delta: number) {
    if (!this.originPos) return;
    const angle = Phaser.Math.Angle.Between(this.originPos.x, this.originPos.y, this.x, this.y);
    const speedX = (this.lifeTime / 90) * Math.cos(angle);
    const speedY = (this.lifeTime / 90) * Math.sin(angle);
    this.setPosition(this.x + speedX, this.y + speedY);
  }
}
