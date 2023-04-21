import { GameObjects, Scene } from 'phaser';

import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { getEquippedSkin, getSkins, isSignedIn, login } from '~/near/nearConnection';
import { emit } from '~/utils/eventEmitterUtils';

export class StoreInterface extends Scene {
  spineFrame: SpineGameObject;
  closeButtonPos = new Phaser.Math.Vector2(1994, 203);
  closeButtonRadius = 100;
  closeButton: Phaser.Geom.Circle;
  closeBtnGraphics: Phaser.GameObjects.Graphics;

  selectButtonPos = new Phaser.Math.Vector2(940, 966);
  selectButtonWidth = 628;
  selectButtonHeight = 148;
  selectButton: Phaser.Geom.Rectangle;
  selectBtnGraphics: Phaser.GameObjects.Graphics;

  selectButtonText: string;
  selectBitmap: GameObjects.BitmapText;

  create(data: any) {
    this.initSpineObjects();
    this.initSelectButtonTextLabel();
    this.initHitAreas();
    this.getData();
    this.sys.events.on('stop', function (data) {
      // perform any other necessary actions here
    });
  }

  update(time: number, delta: number) {
    // TODO (johnedvard) only draw debug if game is in debug mode
    // this.drawDebug();
  }

  drawDebug() {
    if (!this.closeBtnGraphics) return;
    if (!this.selectBtnGraphics) return;
    this.closeBtnGraphics.clear();
    this.closeBtnGraphics.fillCircleShape(this.closeButton);

    this.selectBtnGraphics.clear();
    this.selectBtnGraphics.fillRectShape(this.selectButton);
  }

  private initSelectButtonTextLabel() {
    let originX = -0.25;
    let originY = 0.2;
    if (!isSignedIn()) {
      this.selectButtonText = 'Login';
      originX = -1.2;
      originY = 0.2;
    } else {
      this.selectButtonText = 'Select skin';
    }
    this.selectBitmap = this.add
      .bitmapText(this.selectButtonPos.x, this.selectButtonPos.y, 'atari', this.selectButtonText, 40)
      .setAlpha(1)
      .setOrigin(originX, originY)
      .setDepth(DepthGroup.front);
    this.selectBitmap.setTint(0x000000);
  }

  private initHitAreas() {
    this.initCloseButton();
    this.initSelectButton();
  }

  private initCloseButton() {
    this.closeBtnGraphics = this.add.graphics().setDepth(DepthGroup.front);
    this.closeButton = new Phaser.Geom.Circle(this.closeButtonPos.x, this.closeButtonPos.y, this.closeButtonRadius);
    Phaser.Geom.Circle.Offset(this.closeButton, this.closeButtonRadius, this.closeButtonRadius);

    this.closeBtnGraphics.setInteractive(this.closeButton, Phaser.Geom.Circle.Contains);
    this.closeBtnGraphics.on('pointerover', (pointer) => {
      this.spineFrame.play('close-button-hover', true, true);
    });
    this.closeBtnGraphics.on('pointerout', (pointer) => {
      this.spineFrame.play('idle', true, true);
    });
    this.closeBtnGraphics.on('pointerup', (pointer) => {
      emit(GameEvent.closeStore);
    });
  }
  private initSelectButton() {
    this.selectBtnGraphics = this.add.graphics().setDepth(DepthGroup.front);
    this.selectButton = new Phaser.Geom.Rectangle(
      this.selectButtonPos.x,
      this.selectButtonPos.y,
      this.selectButtonWidth,
      this.selectButtonHeight
    );
    Phaser.Geom.Rectangle.Offset(this.selectButton, 25, -60);

    this.selectBtnGraphics.setInteractive(this.selectButton, Phaser.Geom.Rectangle.Contains);
    this.selectBtnGraphics.on('pointerover', (pointer) => {
      this.spineFrame.play('button-hover', true, true);
    });
    this.selectBtnGraphics.on('pointerout', (pointer) => {
      this.spineFrame.play('idle', true, true);
    });
    this.selectBtnGraphics.on('pointerup', (pointer) => {
      if (isSignedIn()) {
        emit(GameEvent.closeStore);
      } else {
        login();
      }
    });
  }

  private initSpineObjects() {
    this.spineFrame = this.add
      .spine(this.cameras.main.width / 2, this.cameras.main.height / 2, 'storeInterface', 'idle', true)
      .setScale(1)
      .setDepth(DepthGroup.front);
  }

  async getData() {
    console.log(await getSkins());
    console.log(await getEquippedSkin());
  }
}
