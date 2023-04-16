import { Input } from 'phaser';
import { SceneKey } from '~/enums/SceneKey';

const introScript = `Once upon a time, there were
somethin odd happening, and the hero had to face 
her worst nightmares to save the world
`;

// TODO (johnedvard) Add a meaningful new game intro
export class NewGameIntro extends Phaser.Scene {
  startNewGame() {
    this.scene.start(SceneKey.Level);
  }
  listenForInput() {
    this.input.gamepad.on('down', (_pad: Input.Gamepad.Gamepad, button: Input.Gamepad.Button) => {
      this.startNewGame();
    });
    this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
      this.startNewGame();
    });
  }
  preload(): void {}

  create(): void {
    this.add.bitmapText(this.cameras.main.centerX, 200, 'atari', introScript, 24, 1).setAlpha(1).setOrigin(0.5, 0);
    this.listenForInput();
  }
}
