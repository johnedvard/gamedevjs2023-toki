import { Game } from 'phaser';
import 'phaser/plugins/spine4.1/dist/SpinePlugin';

import { getCanvas } from '~/utils/gameUtils';
import { SceneKey } from '~/enums/SceneKey';
import { Boot } from '~/scenes/Boot';
import { Preload } from '~/scenes/Preload';
import { MainMenu } from '~/scenes/MainMenu';
import { NewGameIntro } from '~/scenes/NewGameIntro';
import { UserInterface } from '~/scenes/UserInterface';

import { Level } from './scenes/Level';
import { SceneInput } from './scenes/SceneInput';
import { StoreInterface } from './scenes/StoreInterface';
import { destroySceneHandler, initSceneHandler } from './sceneHandler';
import { initContract } from './near/nearConnection';
import { MatterGravityFixPlugin } from './plugins/MatterGravityFixPlugin';
import { DialogInterface } from './scenes/DialogInterface';
import { emit } from './utils/eventEmitterUtils';
import { GameEvent } from './enums/GameEvent';

const addScenes = (game: Game) => {
  game.scene.add(SceneKey.Preload, Preload);
  game.scene.add(SceneKey.MainMenu, MainMenu);
  game.scene.add(SceneKey.NewGameIntro, NewGameIntro);
  game.scene.add(SceneKey.UserInterface, UserInterface);
  game.scene.add(SceneKey.Level, Level);
  game.scene.add(SceneKey.SceneInput, SceneInput);
  game.scene.add(SceneKey.StoreInterface, StoreInterface);
  game.scene.add(SceneKey.DialogInterface, DialogInterface);
  game.scene.add(SceneKey.Boot, Boot, true);
};

export class Toki {
  game: Game;
  constructor() {
    initContract();
    this.game = new Game({
      type: Phaser.WEBGL,
      canvas: getCanvas(),
      width: 2560, // 16:9 ratio
      height: 1440,
      backgroundColor: '#565A75',
      // pixelArt: true,
      physics: {
        default: 'matter',
        matter: {
          // debug: true, // TODO (johnedvard) remove debug if production
          gravity: { y: 5 },
        },
      },
      input: {
        gamepad: true,
      },
      plugins: {
        scene: [
          {
            key: 'SpinePlugin',
            plugin: window['SpinePlugin'],
            mapping: 'spine',
            sceneKey: 'spine',
          },
          {
            key: 'MatterGravityFixPlugin',
            plugin: MatterGravityFixPlugin,
            mapping: 'matterGravityFix',
            start: true,
          },
        ],
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });
    addScenes(this.game);
    initSceneHandler(this.game);
    this.game.scene.start(SceneKey.SceneInput);
  }
  destroyGame() {
    emit(GameEvent.destroyGame);
    destroySceneHandler();
    this.game.destroy(true);
    this.game = null;
  }
}
