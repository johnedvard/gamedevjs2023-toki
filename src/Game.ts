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
import { initSceneHandler } from './sceneHandler';
import { initContract, isSignedIn, login } from './near/nearConnection';

const addScenes = (game: Game) => {
  game.scene.add(SceneKey.Preload, Preload);
  game.scene.add(SceneKey.MainMenu, MainMenu);
  game.scene.add(SceneKey.NewGameIntro, NewGameIntro);
  game.scene.add(SceneKey.UserInterface, UserInterface);
  game.scene.add(SceneKey.Level, Level);
  game.scene.add(SceneKey.SceneInput, SceneInput);
  game.scene.add(SceneKey.StoreInterface, StoreInterface);
  game.scene.add(SceneKey.Boot, Boot, true);
};

export class Toki {
  constructor() {
    initContract();
    const game = new Game({
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
        ],
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });
    addScenes(game);
    initSceneHandler(game);
    game.scene.start(SceneKey.SceneInput);
  }
}
