import { Scene } from 'phaser';
import { ChainImageState } from '~/types/ChainImageState';

/**
 * Used in a pool for the @see StasisChain
 */
export class ChainImage extends Phaser.GameObjects.Image {
  lifeTime = 500;
  unitLength = 60;
  preDelay = 10; // adding on average 1 chain per frame
  ellapsedTime = 0;
  chainState: ChainImageState = 'inactive';

  constructor(scene: Scene) {
    super(scene, 0, 0, 'chain');
  }

  animate(startPos: Phaser.Math.Vector2, endPos: Phaser.Math.Vector2, index: number, totalChainUnits: number) {
    if (!startPos || !endPos) return;
    this.preDelay = this.preDelay * (totalChainUnits - index);
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

  setChainState(state: ChainImageState) {
    if (this.chainState === state) return;
    this.chainState = state;
    switch (state) {
      case 'started':
        this.lifeTime -= this.preDelay / 2; // make all chain units dissapear (almost) at the same time
        this.setActive(true);
        this.setVisible(true);
        break;
      case 'ended':
        this.setActive(false);
        this.setVisible(false);
        break;
    }
  }

  update(time: number, delta: number) {
    if (this.chainState === 'inactive' || this.chainState === 'ended') return;
    if (this.chainState === 'predelay') {
      this.ellapsedTime += delta;
      if (this.ellapsedTime >= this.preDelay) this.setChainState('started');
      return;
    }

    this.lifeTime -= delta;
    if (this.lifeTime <= 0) {
      this.setChainState('ended');
    }
  }
}
