import { GameObjects, Scene } from 'phaser';
import { Box } from '~/gameobjects/Box';
import { Player } from '~/gameobjects/Player';
import { LevelState } from '~/types/LevelState';
import { SvgPath } from '~/types/SvgPath';
import {
  createTextFromSvg,
  createCollisionBoxesFromPaths,
  createPathsFromSvg,
  getPosFromSvgCircle,
  createBoxesFromSvg,
} from '~/utils/vectorUtils';

const parser = new DOMParser();

export class Level extends Phaser.Scene {
  player: Player;
  graphics: GameObjects.Graphics;
  svgPaths: SvgPath[];
  boxes: Box[];

  preload(): void {
    this.matter.add.mouseSpring(); // TODO (johnedvard) remove if production. Enable through option in debug menu
    this.loadLevel('level1');
    this.graphics = this.add.graphics();
  }

  create(): void {}

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
    this.boxes.forEach((b) => b.update(time, delta));
    this.updateLandscape();
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
    this.svgPaths = createPathsFromSvg(svgDoc);
    createCollisionBoxesFromPaths(scene, this.svgPaths);
    createTextFromSvg(scene, svgDoc);
    this.boxes = createBoxesFromSvg(scene, svgDoc);

    const start = getPosFromSvgCircle(svgDoc, 'start');
    const goal = getPosFromSvgCircle(svgDoc, 'goal');

    return { start, goal };
  }
  updateLandscape() {
    if (!this.svgPaths) return;
    this.graphics.clear();
    this.svgPaths.forEach(({ path, strokeWidth, color, fill }) => {
      if (color != null) this.graphics.lineStyle(strokeWidth, color, 1);
      else this.graphics.lineStyle(0, 0, 0);
      if (fill != null) this.graphics.fillStyle(fill, 1);
      else this.graphics.fillStyle(0, 0);
      // TODO (johnedvard) figure out why fillPath doesn't work
      this.graphics.fillPoints(path.getPoints());
      path.draw(this.graphics);
    });
  }
}
