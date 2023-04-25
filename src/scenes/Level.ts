import { GameObjects, Scene } from 'phaser';
import { GameEvent } from '~/enums/GameEvent';
import { getGameState, loadGame, saveLevelComplete } from '~/gameState';
import { Box } from '~/gameobjects/Box';
import { Door } from '~/gameobjects/Door';
import { Player } from '~/gameobjects/Player';
import { SpinningBar } from '~/gameobjects/SpinningBar';
import { StoreBooth } from '~/gameobjects/StoreBooth';
import { TimeCapsule } from '~/gameobjects/TimeCapsule';

import { LevelState } from '~/types/LevelState';
import { SvgPath } from '~/types/SvgPath';
import { emit, off, on } from '~/utils/eventEmitterUtils';
import { capturedCapsuleDialog, tutorialStartDialog } from '~/utils/tutorialUtils';

import {
  createTextFromSvg,
  createCollisionBoxesFromPaths,
  createPathsFromSvg,
  getPosFromSvgCircle,
  createBoxesFromSvg,
  createSpinningBarsFromSvg,
  createStoreBoothFromSvg,
  createDoorsFromSvg,
  createTimeCapsulesFromSvg,
} from '~/utils/vectorUtils';

const parser = new DOMParser();
// TODO (johnedvard) read automatically from folder instead
const levelIds = ['levelTutorial', 'level0', 'level1'];
const levelSvgTexts: Record<string, string> = {};

export class Level extends Phaser.Scene {
  player: Player;
  graphics: GameObjects.Graphics;
  svgPaths: SvgPath[];
  boxes: Box[];
  spinningBars: SpinningBar[];
  storeBooth: StoreBooth;
  doors: Door[];
  timeCapsules: TimeCapsule[];
  levelId: string;
  maxCapsules: number;
  collectedCapsules = 0;
  numCapsules = 0;

  preload(): void {
    loadGame();
    this.matter.add.mouseSpring(); // TODO (johnedvard) remove if production. Enable through option in debug menu
    this.loadLevels(levelIds);
    this.graphics = this.add.graphics();
  }

  create({ levelId = 'levelTutorial' }: { levelId: string }): void {
    this.stopListeningForEvents();
    this.collectedCapsules = 0;
    this.levelId = levelId;
    this.createLevel(this.levelId);
    setTimeout(() => {
      // using timeout to step once, make sure Level Scene is actually paused
      if (levelId === 'levelTutorial') {
        emit(GameEvent.startDialog, { dialog: tutorialStartDialog });
      }
    });
    this.listenForEvents();
  }

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
    this.storeBooth?.update(time, delta);
    this.boxes?.forEach((b) => b.update(time, delta));
    this.doors?.forEach((d) => d.update(time, delta));
    this.spinningBars?.forEach((b) => b.update(time, delta));
    this.timeCapsules?.forEach((b) => b.update(time, delta));
    this.updateLandscape();
  }

  createAnimations() {}

  loadLevels(levelIds: string[]) {
    levelIds.forEach((levelId) => {
      this.load.text(levelId, `levels/${levelId}.svg`);
      this.load.on('filecomplete', (key: string, _type, svgText: string) => {
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
    this.timeCapsules = createTimeCapsulesFromSvg(scene, svgDoc);
    this.setDoorState(this.doors);

    const start = getPosFromSvgCircle(svgDoc.querySelector(`#start`));

    return { start };
  }
  /** Update properties on the door, e.g. if it can be unlocked or not */
  setDoorState(doors: Door[]) {
    if (this.levelId === 'levelTutorial') return; // Exception for the tutorial level
    const gameState = getGameState();
    console.log('gameState', gameState);
    doors.forEach((d) => {
      if (d.goToLevelId === 'level0') return;
      console.log('goToLevelId', d.goToLevelId);
      const goToLevelNum = parseInt(d.goToLevelId.split('level')[1]); // name pattern is level{number}, e.g. level0 and level1
      console.log('goToLevelNum', goToLevelNum);
      if (gameState[`level${goToLevelNum - 1}`] >= 0) {
        d.canUnlock = true;
      }
    });
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

  onGoToLevel = ({ levelId }: { levelId: string }) => {
    // Save the current level before we go to the next
    saveLevelComplete({ levelId: this.levelId, collectedCapsules: this.collectedCapsules });
  };

  onTimeCapsuleCollected = () => {
    // Exception for the tutorial level
    if (this.levelId === 'levelTutorial') {
      emit(GameEvent.startDialog, { dialog: capturedCapsuleDialog });
    }
    this.collectedCapsules++;
  };
  listenForEvents() {
    on(GameEvent.goToLevel, this.onGoToLevel);
    on(GameEvent.collectTimeCapsule, this.onTimeCapsuleCollected);
  }

  stopListeningForEvents() {
    off(GameEvent.goToLevel, this.onGoToLevel);
    off(GameEvent.collectTimeCapsule, this.onTimeCapsuleCollected);
  }
}
