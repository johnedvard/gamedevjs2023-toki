import { GameObjects, Scene } from 'phaser';
import { Player } from '~/gameobjects/Player';
import { LevelState } from '~/types/LevelState';
import { SvgPath } from '~/types/SvgPath';
import {
  createCollisionBoxesFromPaths,
  createPathsFromSvg,
  getPosFromSvg,
  getStrokeWidth,
  rgbTohex,
} from '~/utils/vectorUtils';

const parser = new DOMParser();

export class Level extends Phaser.Scene {
  player: Player;
  graphics: GameObjects.Graphics;
  svgPaths: SvgPath[];

  preload(): void {
    this.matter.add.mouseSpring(); // TODO (johnedvard) remove if production. Enable through option in debug menu
    this.loadLevel('level1');
    this.graphics = this.add.graphics();
  }

  create(): void {}

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
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

    const start = getPosFromSvg(svgDoc, 'start');
    const goal = getPosFromSvg(svgDoc, 'goal');

    return { start, goal };
  }
  updateLandscape() {
    if (!this.svgPaths) return;
    this.graphics.clear();
    this.svgPaths.forEach(({ path, svgPathEl, strokeWidth }) => {
      const color: number = rgbTohex(svgPathEl.style.stroke);
      const fill: number = rgbTohex(svgPathEl.style.fill);
      if (color != null) this.graphics.lineStyle(strokeWidth, color, 1);
      else this.graphics.lineStyle(1, 0, 1);
      if (fill != null) this.graphics.fillStyle(fill, 1);
      else this.graphics.fillStyle(0, 0);
      path.draw(this.graphics);
    });
  }
}
