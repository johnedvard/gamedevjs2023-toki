import { Scene } from 'phaser';
import { ChainImage } from './ChainImage';

type TProps = {
  pos: Phaser.Math.Vector2;
  numChainUnits: number;
};

export class StasisChain {
  group;
  pos: Phaser.Math.Vector2;
  numChainUnits = 10;

  constructor(private scene: Scene, { pos, numChainUnits }: TProps) {
    this.pos = pos;
    this.numChainUnits = numChainUnits || 10;
    this.createChain();
  }

  private createChain() {
    // Figure out how many chain parts to chain together based on length
    this.group = this.scene.add.group({
      classType: ChainImage,
      maxSize: this.numChainUnits,
      runChildUpdate: true,
    });
  }
  lockAnimation() {
    const max = this.group.getTotalFree();

    const randomRadians = Math.random() * Math.PI * 2;
    const endPos = this.pos.clone().add(this.pos.clone().setAngle(randomRadians));

    for (let i = 0; i < max; i++) {
      const chain: ChainImage = this.group.get();
      chain?.lockAnimation(this.pos, endPos, i, max);
    }
  }

  /**
   * Break a few chains, and scatter them outwards
   */
  unlockAnimation() {
    const radius = 50;
    const max = this.group.getTotalFree();
    const randomStartX = (1 - Math.random() * 2) * radius;
    const randomStartY = (1 - Math.random() * 2) * radius;
    const randomEndX = (1 - Math.random() * 2) * radius;
    const randomEndY = (1 - Math.random() * 2) * radius;
    const startPos = this.pos.clone().add(new Phaser.Math.Vector2(randomStartX, randomStartY));
    const endPos = this.pos.clone().add(new Phaser.Math.Vector2(randomEndX, randomEndY));

    for (let i = 0; i < max; i++) {
      const chain: ChainImage = this.group.get();
      chain.setOriginPos(this.pos);
      chain?.unlockAnimation(startPos, endPos, i);
    }
  }
  destroy() {
    // remove everything related to the chain and animation
  }
}
