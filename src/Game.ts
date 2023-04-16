import { Game } from 'phaser';
import 'phaser/plugins/spine4.1/dist/SpinePlugin';

import { getCanvas } from '~/utils/gameUtils';
import { SceneKey } from '~/enums/SceneKey';
import { Boot } from '~/scenes/Boot';
import { Preload } from '~/scenes/Preload';
import { MainMenu } from '~/scenes/MainMenu';
import { NewGameIntro } from '~/scenes/NewGameIntro';
import { UserInterface } from '~/scenes/UserInterface';

const addScenes = (game: Game) => {
  game.scene.add(SceneKey.Preload, Preload);
  game.scene.add(SceneKey.MainMenu, MainMenu);
  game.scene.add(SceneKey.NewGameIntro, NewGameIntro);
  game.scene.add(SceneKey.UserInterface, UserInterface);
  game.scene.add(SceneKey.Boot, Boot, true);
};

export class Toki {
  constructor() {
    const game = new Game({
      type: Phaser.WEBGL,
      canvas: getCanvas(),
      width: 2560, // 16:9 ratio
      height: 1440,
      backgroundColor: '#4E584A',
      // pixelArt: true,
      physics: {
        default: 'matter',
        matter: {
          // debug: true, // TODO (johnedvard) remove debug if production
          gravity: { y: 0 },
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
  }
}
