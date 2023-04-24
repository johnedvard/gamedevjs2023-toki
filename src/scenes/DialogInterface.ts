import { Scene } from 'phaser';
import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { SpeechBubble } from '~/gameobjects/SpeechBubble';
import { emit } from '~/utils/eventEmitterUtils';

export class DialogInterface extends Scene {
  bubble: SpeechBubble;
  sage: Phaser.GameObjects.Sprite;
  sageDialog: string[] = [
    'Where am I? And why am I trapped in this weird suit?',
    `Everything looks so smooth, so vector-like.\nNot what I'm used used to at all.`,
    `I don't like it!`,
    `It looks like I'm trapped in a different time.\nI better figure out how to return back to my normal self`,
  ];
  currentDialogIndex = 0;
  dialogBitmap;
  create(data: any) {
    // TODO (johnedvard) support any dialog, not just the hardcoded one
    const pos = new Phaser.Math.Vector2(250, this.cameras.main.height - 500);
    const margin = 500;
    // Add UI elements
    this.bubble = new SpeechBubble(this, { pos, width: this.cameras.main.width - margin, height: 400 });
    this.sys.events.on('stop', function (data) {
      // perform any other necessary actions here
    });
    this.createSprite();
    this.dialogBitmap = this.add
      .bitmapText(550, this.cameras.main.height - 400, 'atari', this.sageDialog[this.currentDialogIndex], 28, 0)
      .setAlpha(1)
      .setTint(0)
      .setOrigin(0, 0.5)
      .setInteractive()
      .setLineSpacing(50)
      .setDepth(DepthGroup.front);

    this.listenForInput();
  }
  createSprite() {
    this.add.sprite(350, this.cameras.main.height - 400, 'sage').setDepth(DepthGroup.front);
  }
  update(time: number, delta: number) {
    this.bubble?.update(time, delta);
  }
  listenForInput() {
    this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
      this.continueDialog();
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.primaryDown) {
        this.continueDialog();
      }
    });
  }
  continueDialog() {
    const nextDialog = this.sageDialog[++this.currentDialogIndex];
    if (nextDialog) {
      this.dialogBitmap.setText(nextDialog);
    } else {
      emit(GameEvent.endDialog);
    }
  }
}
