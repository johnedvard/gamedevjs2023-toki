import { Scene, GameObjects, Math } from 'phaser';
import { hasSaveFile } from './utils/gameUtils';

let continueTxt: GameObjects.BitmapText;
let newGameTxt: GameObjects.BitmapText;
let settingsGameTxt: GameObjects.BitmapText;
let quitGameTxt: GameObjects.BitmapText;
let chevron: GameObjects.Triangle;
let chevronScaleDir: number = 1;
const menuItems = [];
const margin = 40;
const chevronOffset = 13;

export const displayMainMenuItems = (scene: Scene): { txt: GameObjects.BitmapText; sceneName: string }[] => {
  const center = new Math.Vector2(scene.cameras.main.centerX, scene.cameras.main.centerY);
  if (hasSaveFile()) {
    continueTxt = scene.add
      .bitmapText(center.x, center.y + margin * menuItems.length, 'atari', 'Continue', 28)
      .setAlpha(1)
      .setOrigin(0.5, 1);
    menuItems.push({ txt: continueTxt, sceneName: 'Continue' });
  }
  newGameTxt = scene.add
    .bitmapText(center.x, center.y + margin * menuItems.length, 'atari', 'New Game', 28)
    .setAlpha(1)
    .setOrigin(0.5, 1);
  menuItems.push({ txt: newGameTxt, sceneName: 'NewGameIntro' });
  settingsGameTxt = scene.add
    .bitmapText(center.x, center.y + margin * menuItems.length, 'atari', 'Settings', 28)
    .setAlpha(1)
    .setOrigin(0.5, 1);
  menuItems.push({ txt: settingsGameTxt, sceneName: 'Settings' });
  quitGameTxt = scene.add
    .bitmapText(center.x, center.y + margin * menuItems.length, 'atari', 'Quit Game', 28)
    .setAlpha(1)
    .setOrigin(0.5, 1);
  menuItems.push({ txt: quitGameTxt, sceneName: 'QuitGame' });
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
