import { Input } from 'phaser';
import { DepthGroup } from '~/enums/DepthGroup';
import { SceneKey } from '~/enums/SceneKey';

const introScript = `While modern history was set into motion by the True Arcadians,
something must have set the stage for them 
— for the chaotic world they struggled against in those first,
desperate days. We say the the first True Arcadians had no memories
of what came before their awakening, and this is true;
their lives essentially began the moment they arrived.
But all True Arcadians know one thing: everything broke,
and Arcadia is all that's left.
Simply put, the Shattering created Arcadia... 
but exactly what shattered and why has been the subject
of obsessive research and furious debate over the centuries.
Every artifact, every structure buried in this world holds
a piece of that puzzle!`;

// TODO (johnedvard) Add a meaningful new game intro
export class NewGameIntro extends Phaser.Scene {
  spineObject: SpineGameObject;
  startNewGame() {
    this.scene.start(SceneKey.Level, { levelId: 'levelTutorial' });
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
    this.add.bitmapText(this.cameras.main.centerX, 200, 'atari', introScript, 33, 1).setAlpha(1).setOrigin(0.5, 0);
    this.listenForInput();
    this.initSpineObject();
  }

  initSpineObject() {
    const pos = new Phaser.Math.Vector2(this.cameras.main.width / 2, this.cameras.main.height - 500);
    this.spineObject = this.add.spine(pos.x, pos.y, 'sageFloating', 'idle', true).setDepth(DepthGroup.player);
  }
}
