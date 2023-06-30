const mode: GameMode = import.meta.env.VITE_MODE || 'dev';

import { GameObjects, Scene } from 'phaser';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { getGameState, loadGame, saveLevelComplete } from '~/gameState';
import { Box } from '~/gameobjects/Box';
import { Door } from '~/gameobjects/Door';
import { Hook } from '~/gameobjects/Hook';
import { Platform } from '~/gameobjects/Platform';
import { Player } from '~/gameobjects/Player';
import { SpinningBar } from '~/gameobjects/SpinningBar';
import { StoreBooth } from '~/gameobjects/StoreBooth';
import { TimeCapsule } from '~/gameobjects/TimeCapsule';
import { GameMode } from '~/types/GameMode';

import { LevelState } from '~/types/LevelState';
import { SvgPath } from '~/types/SvgPath';
import { emit, off, on } from '~/utils/eventEmitterUtils';
import { playTimeCapsulePickup } from '~/utils/soundUtils';
import { capturedCapsuleDialog, gameWonDialog, tutorialStartDialog } from '~/utils/tutorialUtils';

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
  createPlatformsFromSvg,
  createHooksFromSvg,
} from '~/utils/vectorUtils';

type TCreateLevel = { levelId: string; fromLevelId: string };

const parser = new DOMParser();
// TODO (johnedvard) read automatically from folder instead
const levelIds = ['levelTutorial', 'level0', 'level1', 'level2', 'level3'];
const levelSvgTexts: Record<string, string> = {};

export class Level extends Phaser.Scene {
  player: Player;
  graphics: GameObjects.Graphics;
  graphicsBack: GameObjects.Graphics;
  graphicsFront: GameObjects.Graphics;
  bitmapTexts: Phaser.GameObjects.BitmapText[];
  svgPaths: SvgPath[];
  boxes: Box[];
  spinningBars: SpinningBar[];
  storeBooth: StoreBooth;
  doors: Door[];
  timeCapsules: TimeCapsule[];
  platforms: Platform[];
  collisionBoxes: MatterJS.BodyType[];
  hooks: Hook[];
  levelId: string;
  maxCapsules: number;
  collectedCapsules = 0;
  numCapsules = 0;
  hasDisplayedGameClearDialog = false;
  hasDisplayedTutroialDialog = false;

  groupFront: GameObjects.Group;
  groupBack: GameObjects.Group;

  preload(): void {
    loadGame();
    this.load.setPath('assets/toki');
    // this.matter.add.mouseSpring(); // TODO (johnedvard) remove if production. Enable through option in debug menu
    this.loadLevels(levelIds);

    this.graphics = this.add.graphics().setDepth(DepthGroup.back);
    this.graphicsFront = this.add.graphics().setDepth(DepthGroup.back + 1);
    this.graphicsBack = this.add.graphics().setDepth(DepthGroup.back - 1);
  }

  create({ levelId = 'levelTutorial', fromLevelId }: TCreateLevel): void {
    this.stopListeningForEvents();
    this.collectedCapsules = 0;
    this.levelId = levelId;
    this.createLevel({ levelId, fromLevelId });
    setTimeout(() => {
      // using timeout to step once, make sure Level Scene is actually paused
      if (levelId === 'levelTutorial' && !this.hasDisplayedTutroialDialog) {
        emit(GameEvent.startDialog, { dialog: tutorialStartDialog });
        this.hasDisplayedTutroialDialog = true;
      }

      if (mode != 'dev') {
        this.checkIfGameCleared();
      }
    });
    this.listenForEvents();
  }

  createLandskape() {
    // group parallaxPaths
    this.groupFront = this.add.group();
    this.groupBack = this.add.group();
    // TODO (johnedvard) use array instead of copying
    this.graphicsBack.clear();
    this.graphics.clear();
    this.graphicsFront.clear();

    this.svgPaths.forEach(({ path, strokeWidth, color, fill, attributes }) => {
      if (color != null) {
        this.graphics.lineStyle(strokeWidth, color, 1);
        this.graphicsBack.lineStyle(strokeWidth, color, 1);
        this.graphicsFront.lineStyle(strokeWidth, color, 1);
      } else {
        this.graphics.lineStyle(0, 0, 0);
        this.graphicsBack.lineStyle(0, 0, 0);
        this.graphicsFront.lineStyle(0, 0, 0);
      }
      if (fill != null) {
        this.graphics.fillStyle(fill, 1);
        this.graphicsBack.fillStyle(fill, 1);
        this.graphicsFront.fillStyle(fill, 1);
      } else {
        this.graphics.fillStyle(0, 0);
        this.graphicsBack.fillStyle(0, 0);
        this.graphicsFront.fillStyle(0, 0);
      }
      // TODO (johnedvard) figure out why fillPath doesn't work
      if (attributes?.isParallaxBack) {
        this.graphicsBack.fillPoints(path.getPoints());
        path.draw(this.graphicsBack);
        this.groupBack.add(this.graphicsBack);
      } else if (attributes?.isParallaxFront) {
        this.graphicsFront.fillPoints(path.getPoints());
        path.draw(this.graphicsFront);
        this.groupFront.add(this.graphicsFront);
      } else {
        this.graphics.fillPoints(path.getPoints());
        path.draw(this.graphics);
        this.graphics.translateCanvas(0, 0);
      }
    });
  }

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
    this.storeBooth?.update(time, delta);
    this.boxes?.forEach((b) => b.update(time, delta));
    this.doors?.forEach((d) => d.update(time, delta));
    this.spinningBars?.forEach((b) => b.update(time, delta));
    this.timeCapsules?.forEach((b) => b.update(time, delta));
    this.platforms?.forEach((b) => b.update(time, delta));
    this.hooks?.forEach((b) => b.update(time, delta));
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

  createLevel({ levelId, fromLevelId }: TCreateLevel) {
    this.player?.destroy();
    const svgText = levelSvgTexts[levelId];
    const levelState = this.createLevelFromSvg(this, svgText);
    let pos = levelState.start;
    this.createLandskape();
    // Spawn player on the position of the door the player entered
    // TODO (johnedvard) Improve the spawn point logic
    const cameFromDoor = this.doors.find((d) => levelId === 'level0' && d.goToLevelId === fromLevelId);
    if (cameFromDoor) pos = new Phaser.Math.Vector2(cameFromDoor.body.position.x, cameFromDoor.body.position.y);
    this.player = new Player(this, { pos });
  }

  createLevelFromSvg(scene: Scene, svgText: string): LevelState {
    const svgDoc: Document = parser.parseFromString(svgText, 'image/svg+xml');
    this.svgPaths = createPathsFromSvg(svgDoc);
    this.collisionBoxes = createCollisionBoxesFromPaths(scene, this.svgPaths);
    this.bitmapTexts = createTextFromSvg(scene, svgDoc);
    this.boxes = createBoxesFromSvg(scene, svgDoc);
    this.spinningBars = createSpinningBarsFromSvg(scene, svgDoc);
    this.storeBooth = createStoreBoothFromSvg(scene, svgDoc);
    this.doors = createDoorsFromSvg(scene, svgDoc);
    this.timeCapsules = createTimeCapsulesFromSvg(scene, svgDoc);
    this.platforms = createPlatformsFromSvg(scene, svgDoc);
    this.hooks = createHooksFromSvg(scene, svgDoc);
    this.setDoorState(this.doors);

    const start = getPosFromSvgCircle(svgDoc.querySelector(`#start`));

    return { start };
  }
  /** Update properties on the door, e.g. if it can be unlocked or not */
  setDoorState(doors: Door[]) {
    if (this.levelId === 'levelTutorial') return; // Exception for the tutorial level
    const gameState = getGameState();
    doors.forEach((d) => {
      if (d.goToLevelId === 'level0') return;
      const goToLevelNum = parseInt(d.goToLevelId.split('level')[1]); // name pattern is level{number}, e.g. level0 and level1
      if (gameState[`level${goToLevelNum - 1}`] >= 0) {
        d.canUnlock = true;
      }
    });
  }

  updateLandscape() {
    if (!this.svgPaths) return;

    const parallaxFactorFront = this.cameras.main.scrollX / 4;
    const parallaxFactorBack = (this.cameras.main.scrollX / 10) * -1;
    this.groupFront?.shiftPosition(parallaxFactorFront, 0);
    this.groupBack?.shiftPosition(parallaxFactorBack, 0);
  }
  destroyLevel() {
    this.player?.destroy();
    this.storeBooth?.destroy();
    this.collisionBoxes?.forEach((b) => this.matter.world.remove(b));
    this.bitmapTexts?.forEach((b) => b.destroy());
    this.collisionBoxes.length = 0;
    this.boxes?.forEach((b) => b?.destroy());
    this.boxes.length = 0;
    this.doors?.forEach((d) => d?.destroy());
    this.doors.length = 0;
    this.spinningBars?.forEach((b) => b?.destroy());
    this.spinningBars.length = 0;
    this.timeCapsules?.forEach((b) => b?.destroy());
    this.timeCapsules.length = 0;
    this.platforms?.forEach((b) => b?.destroy());
    this.platforms.length = 0;
    this.hooks?.forEach((b) => b?.destroy());
    this.hooks.length = 0;
  }
  restartLevel({ levelId }: { levelId: string }) {
    this.destroyLevel();

    this.create({ levelId, fromLevelId: this.levelId });
  }

  onGoToLevel = ({ levelId }: { levelId: string }) => {
    this.stopListeningForEvents();
    // Save the current level before we go to the next
    saveLevelComplete({ levelId: this.levelId, collectedCapsules: this.collectedCapsules });
    this.restartLevel({ levelId });
  };

  onTimeCapsuleCollected = () => {
    // Exception for the tutorial level
    if (this.levelId === 'levelTutorial') {
      emit(GameEvent.startDialog, { dialog: capturedCapsuleDialog });
    }
    playTimeCapsulePickup();
    this.collectedCapsules++;
  };

  onRestartLevel = () => {
    this.restartLevel({ levelId: this.levelId });
  };
  onDestroyGame = () => {
    this.destroyLevel();
  };

  listenForEvents() {
    on(GameEvent.goToLevel, this.onGoToLevel);
    on(GameEvent.collectTimeCapsule, this.onTimeCapsuleCollected);
    on(GameEvent.restartLevel, this.onRestartLevel);
    on(GameEvent.destroyGame, this.onDestroyGame);
  }

  stopListeningForEvents() {
    off(GameEvent.goToLevel, this.onGoToLevel);
    off(GameEvent.collectTimeCapsule, this.onTimeCapsuleCollected);
    off(GameEvent.restartLevel, this.onRestartLevel);
    off(GameEvent.destroyGame, this.onDestroyGame);
  }

  checkIfGameCleared() {
    if (this.hasDisplayedGameClearDialog) return;
    const levelsThatCanBeCleared = ['level1', 'level2', 'level3'];
    const gameState = getGameState();
    let hasWon = true;
    levelsThatCanBeCleared.forEach((l) => {
      if (gameState[l] === undefined) {
        hasWon = false;
      }
    });
    if (hasWon) {
      emit(GameEvent.startDialog, { dialog: gameWonDialog });
      this.hasDisplayedGameClearDialog = true;
    }
  }
}
