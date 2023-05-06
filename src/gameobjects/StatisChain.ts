import { Scene } from 'phaser';
import { ChainImage } from './ChainImage';

type TProps = {
  pos: Phaser.Math.Vector2;
  length: number;
};

export class StasisChain {
  group;
  pos: Phaser.Math.Vector2;
  endPos: Phaser.Math.Vector2;
  length: number;
  numChainUnits = 10;
  radius = 500;
  constructor(private scene: Scene, { pos, length }: TProps) {
    this.pos = pos;
    this.length = length;
    this.createChain();
  }

  private createChain() {
    // Figure out how many chain parts to chain together based on length
    this.group = this.scene.add.group({
      classType: ChainImage,
      maxSize: this.numChainUnits,
      runChildUpdate: true,
    });

    const radians = Math.random() * Math.PI * 2;
    this.endPos = this.pos.clone().add(this.pos.clone().setAngle(radians));
  }
  animate() {
    const max = this.group.getTotalFree();

    for (let i = 0; i < max; i++) {
      const chain = this.group.get();
      chain?.animate(this.pos, this.endPos, i, max);
    }
  }
  destroy() {
    // remove everything related to the chain and animation
  }
}
