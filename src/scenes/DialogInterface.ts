import { Scene } from 'phaser';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { SpeechBubble } from '~/gameobjects/SpeechBubble';
import { emit } from '~/utils/eventEmitterUtils';

export class DialogInterface extends Scene {
  bubble: SpeechBubble;
  sage: Phaser.GameObjects.Sprite;
  dialog: string[] = [];
  dialogIndex = 0;
  dialogBitmap;
  renderTexture;
  isInputDisabled: boolean;
  maxInputDelay = 1000;
  ellapsedInputDelay = 0;

  create({ dialog = [] }: { dialog: string[] }) {
    this.isInputDisabled = true;
    this.ellapsedInputDelay = 0;
    this.dialogIndex = 0;
    this.dialog = dialog;
    const pos = new Phaser.Math.Vector2(250, this.cameras.main.height - 500);
    const margin = 500;
    // Add UI elements
    this.bubble = new SpeechBubble(this, { pos, width: this.cameras.main.width - margin, height: 400 });
    this.sys.events.on('stop', function (data) {
      // perform any other necessary actions here
    });
    this.createSprite();
    this.createDialogBitmap();
    this.createDialogTexture();
    this.renderDialog(this.dialog[this.dialogIndex]);
    this.listenForInput();
  }
  createSprite() {
    this.add.sprite(350, this.cameras.main.height - 400, 'sage').setDepth(DepthGroup.front);
  }
  update(time: number, delta: number) {
    this.bubble?.update(time, delta);
    this.ellapsedInputDelay += delta;
    if (this.ellapsedInputDelay <= this.maxInputDelay) {
      this.isInputDisabled = true;
    } else {
      this.isInputDisabled = false;
    }
  }
  listenForInput() {
    this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
      if (this.isInputDisabled) return;
      this.continueDialog();
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isInputDisabled) return;
      if (pointer.primaryDown) {
        this.continueDialog();
      }
    });
  }

  /**
   * Need to convert the bitmap text to a texture in order to make the shader work properly
   */
  renderDialog(text: string) {
    this.dialogBitmap?.setText(text)?.setAlpha(1);
    this.renderTexture?.clear();
    this.renderTexture?.draw(this.dialogBitmap, 550, this.cameras.main.height - 400);
    this.dialogBitmap?.setAlpha(0); // trick to hide the text without having to destroy and recreate it.
  }
  createDialogTexture() {
    this.renderTexture = this.make
      .renderTexture({
        x: 0,
        y: 0,
        width: this.cameras.main.width,
        height: this.cameras.main.height,
      })
      .setDepth(DepthGroup.front)
      .setOrigin(0, 0);
  }

  createDialogBitmap() {
    this.dialogBitmap = this.add
      .bitmapText(0, 0, 'atari', '', 28, 0)
      .setAlpha(1)
      .setTint(0)
      .setOrigin(0, 0.5)
      .setInteractive()
      .setLineSpacing(50)
      .setDepth(DepthGroup.front);
  }

  continueDialog() {
    const nextDialog = this.dialog[++this.dialogIndex];
    if (nextDialog) {
      this.ellapsedInputDelay = 0;
      this.renderDialog(nextDialog);
    } else {
      emit(GameEvent.endDialog);
    }
  }
}
