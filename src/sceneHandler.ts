import { Game } from 'phaser';
import { SceneKey } from './enums/SceneKey';
import { on } from './utils/eventEmitterUtils';
import { GameEvent } from './enums/GameEvent';

let game: Game;
let counter = 0;

const openStore = (evt) => {
  const isInterfaceActive = game.scene.isActive(SceneKey.StoreInterface);
  if (!isInterfaceActive) {
    game.scene.pause(SceneKey.Level);
    game.scene.start(SceneKey.StoreInterface, { test: ++counter });
  }
};

const closeStore = (evt) => {
  const isInterfaceActive = game.scene.isActive(SceneKey.StoreInterface);
  if (isInterfaceActive) {
    game.scene.stop(SceneKey.StoreInterface);
    game.scene.resume(SceneKey.Level);
  }
};

const startDialog = ({ dialog }: { dialog: any } = { dialog: '' }) => {
  const isInterfaceActive = game.scene.isActive(SceneKey.DialogInterface);
  console.log('isInterfaceActive', isInterfaceActive);
  if (!isInterfaceActive) {
    game.scene.pause(SceneKey.Level);
    game.scene.start(SceneKey.DialogInterface, { dialog });
  }
};

const endDialog = (evt) => {
  const isInterfaceActive = game.scene.isActive(SceneKey.DialogInterface);
  if (isInterfaceActive) {
    game.scene.stop(SceneKey.DialogInterface);
    game.scene.resume(SceneKey.Level);
  }
};
const goToLevel = ({ levelId }: { levelId: string }) => {
  game.scene.start(SceneKey.NextLevel, { levelId });
};
/**
 * Call only once (when the game starts)
 * Listen for events and manage scenes, such as settings and inventory
 */
export const initSceneHandler = (g: Game) => {
  game = g;
  on(GameEvent.openStore, openStore);
  on(GameEvent.closeStore, closeStore);
  on(GameEvent.goToLevel, goToLevel);
  on(GameEvent.startDialog, startDialog);
  on(GameEvent.endDialog, endDialog);
};
