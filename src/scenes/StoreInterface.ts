import { GameObjects, Scene } from 'phaser';

import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import { equipSkin, getEquippedSkin, getSkins, isSignedIn, login, nftTokensForOwner } from '~/near/nearConnection';
import { emit } from '~/utils/eventEmitterUtils';
import { getSkinMapping } from '~/utils/playerUtils';

export class StoreInterface extends Scene {
  spineFrame: SpineGameObject;
  skinSlots: SpineGameObject[] = [];
  playerSkins: SpineGameObject[] = [];
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

  skinNum = 3;
  skinNames = ['blue', 'green', 'red'];
  nearSkinNames = ['skin-003-blue', 'skin-002-green', 'skin-001-red'];
  equippedSkin = this.nearSkinNames[0];
  isInitialized = false;
  selectedSkin;

  create(data: any) {
    this.initSpineObjects();
    this.initSlots();
    this.getNfts().then((res) => {
      console.log('res', res);
    });
    this.initSelectButtonTextLabel();
    this.initHitAreas();

    this.sys.events.on('stop', (data) => {
      console.log('destroy');
      // perform any other necessary actions here
    });
    this.isInitialized = true;
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

  private initSlots() {}

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
        if (this.selectedSkin && this.selectedSkin != this.equippedSkin) {
          equipSkin(this.selectedSkin);
          const skinName = getSkinMapping(this.selectedSkin);
          emit(GameEvent.changeSkin, { skinName });
        }
        emit(GameEvent.closeStore);
      } else {
        login();
      }
    });
  }

  private initSpineObjects() {
    this.skinSlots.length = 0;
    this.playerSkins.length = 0;
    this.spineFrame = this.add
      .spine(this.cameras.main.width / 2, this.cameras.main.height / 2, 'storeInterface', 'idle', true)
      .setScale(1)
      .setDepth(DepthGroup.front);

    const startX = 848;
    const startY = 608;
    const size = 400;
    const margin = 40;
    console.log('this.skinSlots', this.skinSlots.length);
    for (let i = 0; i < this.skinNum; i++) {
      const skinSlot = this.add
        .spine(startX + i * (size + margin), startY, 'skinSlot', 'idle', true)
        .setScale(1)
        .setDepth(DepthGroup.front)
        .setInteractive();
      skinSlot.on('pointerup', (pointer) => {
        let index = 0;
        this.skinSlots.forEach((s, i) => {
          if (s === skinSlot) index = i;
          s.play('idle', true, true);
        });
        this.playerSkins.forEach((p) => p.play('idle', true, true));
        skinSlot.play('selected', true, true);
        this.playerSkins[index].play('walk', true, true);
        this.selectedSkin = this.nearSkinNames[index];
      });
      skinSlot.on('pointerover', (pointer) => {});
      this.skinSlots.push(skinSlot);

      const playerSkin = this.add
        .spine(startX + i * (size + margin), startY + 40, 'hero', 'idle', true)
        .setScale(1)
        .setDepth(DepthGroup.front)
        .setInteractive()
        .setSkinByName(this.skinNames[i]);
      this.playerSkins.push(playerSkin);
    }
  }

  async getData() {
    console.log(await getSkins());
    const equippedSkin = await getEquippedSkin();
    console.log('equippedSkin', equippedSkin);
    if (equippedSkin) {
      this.equippedSkin = equippedSkin;
      console.log('this.equippedSkin', this.equippedSkin);
      const index = this.nearSkinNames.findIndex((value) => value === this.equippedSkin);
      console.log('index', index);
      if (index != -1) {
        if (this.playerSkins[index]) {
          this.playerSkins[index].play('walk', true, true);
        }
        if (this.skinSlots[index]) {
          this.skinSlots[index].play('selected', true, true);
        }
      }
    }
  }

  getNfts() {
    return nftTokensForOwner();
  }
}
