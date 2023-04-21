import { Game } from 'phaser';
import { SceneKey } from './enums/SceneKey';
import { on } from './utils/eventEmitterUtils';
import { GameEvent } from './enums/GameEvent';

let game: Game;
let counter = 0;

const onOpenStore = (evt) => {
  const isInterfaceActive = game.scene.isActive(SceneKey.StoreInterface);
  if (isInterfaceActive) {
    game.scene.stop(SceneKey.StoreInterface);
    game.scene.resume(SceneKey.Level);
  } else {
    game.scene.pause(SceneKey.Level);
    game.scene.start(SceneKey.StoreInterface, { test: ++counter });
  }
};

/**
 * Call only once (when the game starts)
 * Listen for events and manage scenes, such as settings and inventory
 */
export const initSceneHandler = (g: Game) => {
  game = g;
  on(GameEvent.openStore, onOpenStore);
};
