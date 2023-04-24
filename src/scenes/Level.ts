import { GameObjects, Scene } from 'phaser';
import { GameEvent } from '~/enums/GameEvent';
import { Box } from '~/gameobjects/Box';
import { Door } from '~/gameobjects/Door';
import { Player } from '~/gameobjects/Player';
import { SpinningBar } from '~/gameobjects/SpinningBar';
import { StoreBooth } from '~/gameobjects/StoreBooth';

import { LevelState } from '~/types/LevelState';
import { SvgPath } from '~/types/SvgPath';
import { on } from '~/utils/eventEmitterUtils';
import {
  createTextFromSvg,
  createCollisionBoxesFromPaths,
  createPathsFromSvg,
  getPosFromSvgCircle,
  createBoxesFromSvg,
  createSpinningBarsFromSvg,
  createStoreBoothFromSvg,
  createDoorsFromSvg,
} from '~/utils/vectorUtils';

const parser = new DOMParser();
const levelIds = ['levelTutorial', 'level0'];
const levelSvgTexts: Record<string, string> = {};

export class Level extends Phaser.Scene {
  player: Player;
  graphics: GameObjects.Graphics;
  svgPaths: SvgPath[];
  boxes: Box[];
  spinningBars: SpinningBar[];
  storeBooth: StoreBooth;
  doors: Door[];
  levelId: string;

  preload(): void {
    // this.matter.add.mouseSpring(); // TODO (johnedvard) remove if production. Enable through option in debug menu
    this.loadLevels(levelIds);
    this.graphics = this.add.graphics();
  }

  create({ levelId = 'levelTutorial' }: { levelId: string }): void {
    this.levelId = levelId;
    this.createLevel(this.levelId);
  }

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
    this.storeBooth?.update(time, delta);
    this.boxes?.forEach((b) => b.update(time, delta));
    this.doors?.forEach((d) => d.update(time, delta));
    this.spinningBars?.forEach((b) => b.update(time, delta));
    this.updateLandscape();
  }

  createAnimations() {}

  loadLevels(levelIds: string[]) {
    levelIds.forEach((levelId) => {
      this.load.text(levelId, `levels/${levelId}.svg`);
      this.load.on('filecomplete', (key: string, _type, svgText: string) => {
        console.log();
        if (key === levelId) {
          levelSvgTexts[levelId] = svgText;
        }
      });
    });
  }

  createLevel(levelId: string) {
    this.player?.destroy();
    const svgText = levelSvgTexts[levelId];
    const levelState = this.createLevelFromSvg(this, svgText);
    this.player = new Player(this, { pos: levelState.start });
  }

  createLevelFromSvg(scene: Scene, svgText: string): LevelState {
    const svgDoc: Document = parser.parseFromString(svgText, 'image/svg+xml');
    this.svgPaths = createPathsFromSvg(svgDoc);
    createCollisionBoxesFromPaths(scene, this.svgPaths);
    createTextFromSvg(scene, svgDoc);
    this.boxes = createBoxesFromSvg(scene, svgDoc);
    this.spinningBars = createSpinningBarsFromSvg(scene, svgDoc);
    this.storeBooth = createStoreBoothFromSvg(scene, svgDoc);
    this.doors = createDoorsFromSvg(scene, svgDoc);

    const start = getPosFromSvgCircle(svgDoc.querySelector(`#start`));

    return { start };
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
