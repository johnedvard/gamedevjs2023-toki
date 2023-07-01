import { Scene, GameObjects, Math } from 'phaser';
import { hasSaveFile } from './gameState';
import { SceneKey } from './enums/SceneKey';

let continueTxt: GameObjects.BitmapText;
let newGameTxt: GameObjects.BitmapText;
let chevron: GameObjects.Triangle;
let chevronScaleDir: number = 1;
let scene: Scene;
const menuItems = [];
const margin = 40;
const chevronOffset = 13;

const onContinuePointerUp = () => {
  scene.scene.start(SceneKey.Level, { levelId: 'level0' });
};
const onNewGamePointerUp = () => {
  scene.scene.start(SceneKey.NewGameIntro);
};

export const displayMainMenuItems = (myScene: Scene): { txt: GameObjects.BitmapText; sceneName: string }[] => {
  menuItems.length = 0;
  scene = myScene;
  const center = new Math.Vector2(scene.cameras.main.centerX, scene.cameras.main.centerY);
  if (hasSaveFile()) {
    continueTxt = scene.add
      .bitmapText(center.x, center.y + margin * menuItems.length, 'atari', 'Continue', 28)
      .setAlpha(1)
      .setOrigin(0.5, 1)
      .setInteractive();
    continueTxt.on('pointerup', onContinuePointerUp);
    menuItems.push({ txt: continueTxt, sceneName: SceneKey.Level, args: { levelId: 'level0' } });
  }
  newGameTxt = scene.add
    .bitmapText(center.x, center.y + margin * menuItems.length, 'atari', hasSaveFile() ? 'Tutorial' : 'New Game', 28)
    .setAlpha(1)
    .setOrigin(0.5, 1)
    .setInteractive();
  newGameTxt.on('pointerup', onNewGamePointerUp);
  menuItems.push({ txt: newGameTxt, sceneName: SceneKey.NewGameIntro });
  return menuItems;
};

export const highlightSelectedMenu = (scene: Scene, delta: number, { index }: { index: number }) => {
  if (!chevron) chevron = scene.add.triangle(200, 400, 0, 0, 35, 10, 0, 20, 0xffffff).setOrigin(0.5);
  const center = new Math.Vector2(scene.cameras.main.centerX, scene.cameras.main.centerY);
  chevron.setPosition(center.x - 150, center.y - chevronOffset + margin * index);
  if (chevron.scaleY <= -1) {
    chevronScaleDir = 1;
    chevron.setScale(chevron.scaleX, -1);
  }
  if (chevron.scaleY >= 1) {
    chevronScaleDir = -1;
    chevron.setScale(chevron.scaleX, 1);
  }

  chevron.setScale(chevron.scaleX, chevron.scaleY + (delta * chevronScaleDir) / 750);
};

export const destroyMenu = () => {
  newGameTxt?.off('pointerup', onContinuePointerUp);
  continueTxt?.off('pointerup', onNewGamePointerUp);
  continueTxt?.destroy();
  newGameTxt?.destroy();
  chevron?.destroy();
  continueTxt = null;
  newGameTxt = null;
  chevron = null;
};
