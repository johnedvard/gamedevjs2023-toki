import { Scene } from 'phaser';
import { Player } from '~/gameobjects/Player';
import { LevelState } from '~/types/LevelState';
import { createCollisionBoxesFromPaths, createPathsFromSvg, getPosFromSvg } from '~/utils/vectorUtils';

const parser = new DOMParser();

export class Level extends Phaser.Scene {
  player: Player;
  preload(): void {
    this.matter.add.mouseSpring(); // TODO (johnedvard) remove if production. Enable through option in debug menu
    this.loadLevel('level1');
  }

  create(): void {}

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
  }

  createAnimations() {}

  loadLevel(levelId: string) {
    this.load.text(levelId, `levels/${levelId}.svg`);
    this.load.on('filecomplete', (key: string, _type, svgText: string) => {
      if (key === levelId) {
        const levelState = this.createLevelFromSvg(this, svgText);
        this.player = new Player(this, { pos: levelState.start });
      }
    });
  }
  createLevelFromSvg(scene: Scene, svgText: string): LevelState {
    const svgDoc: Document = parser.parseFromString(svgText, 'image/svg+xml');
    const svgPaths = createPathsFromSvg(svgDoc);
    createCollisionBoxesFromPaths(scene, svgPaths);
    const start = getPosFromSvg(svgDoc, 'start');
    const goal = getPosFromSvg(svgDoc, 'goal');

    return { start, goal };
  }
}
