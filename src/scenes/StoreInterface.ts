const mode = import.meta.env.VITE_MODE || 'testnet';

import { GameObjects, Scene } from 'phaser';

import { DepthGroup } from '~/enums/DepthGroup';
import { GameEvent } from '~/enums/GameEvent';
import {
  equipSkin,
  getEquippedSkinName,
  getNftSeriesId,
  isSignedIn,
  login,
  nftBuy,
  nftTokensForOwner,
} from '~/near/nearConnection';
import { NftSeriesId } from '~/types/NftSeriesId';
import { emit } from '~/utils/eventEmitterUtils';

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
  skins: { name: string; isOwned: boolean; seriesId: NftSeriesId; price: string; nearPrice: string }[] = [
    { name: 'blue', isOwned: true, seriesId: undefined, price: undefined, nearPrice: undefined },
    {
      name: 'green',
      isOwned: false,
      seriesId: getNftSeriesId('tokiGreen'),
      price: '1050000000000000000000000',
      nearPrice: '1',
    },
    {
      name: 'red',
      isOwned: false,
      seriesId: getNftSeriesId('tokiRed'),
      price: '1050000000000000000000000',
      nearPrice: '1',
    },
  ];

  equippedSkinName = '';
  selectedSkinName = '';
  isInitialized = false;

  create(data: any) {
    this.equippedSkinName = getEquippedSkinName();
    this.selectedSkinName = getEquippedSkinName();
    this.initSpineObjects();
    this.getNftsAndUpdateOwnership();
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

  private initSelectButtonTextLabel() {
    let originX = -0.25;
    let originY = 0.2;
    if (!isSignedIn()) {
      this.selectButtonText = 'Login';
      originX = -1.2;
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
        const selectedSkin = this.skins.find((s) => s.name === this.selectedSkinName);
        if (!selectedSkin.isOwned) {
          nftBuy({ token_series_id: selectedSkin.seriesId, priceInYoctoNear: selectedSkin.price });
          this.selectBitmap.setText('Buying NFT');
          this.selectBitmap.setOrigin(-0.35, this.selectBitmap.originY);
        } else {
          equipSkin(this.selectedSkinName);
          emit(GameEvent.changeSkin, { skinName: this.selectedSkinName });
          emit(GameEvent.closeStore);
        }
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

    for (let i = 0; i < this.skinNum; i++) {
      const skinSlot = this.add
        .spine(startX + i * (size + margin), startY, 'skinSlot', 'idle', true)
        .setScale(1)
        .setDepth(DepthGroup.front)
        .setInteractive();
      const selectedSkinNameIndex = this.skins.findIndex((s) => s.name === this.selectedSkinName);
      if (selectedSkinNameIndex === i) {
        skinSlot.play('selected', true, true);
      }
      skinSlot.on('pointerup', (pointer) => {
        let index = 0;
        this.skinSlots.forEach((s, i) => {
          if (s === skinSlot) index = i;
          s.play('idle', true, true);
        });
        this.playerSkins.forEach((p) => p.play('idle', true, true));
        skinSlot.play('selected', true, true);
        const skin = this.skins[index];
        this.playerSkins[index].play('walk', true, true);
        this.selectedSkinName = skin.name;
        if (isSignedIn()) {
          if (!skin.isOwned) {
            this.selectBitmap.setText(`Buy for ${skin.nearPrice} NEAR`);
            this.selectBitmap.setOrigin(-0.1, this.selectBitmap.originY);
          } else {
            this.selectBitmap.setText(`Select skin`);
            this.selectBitmap.setOrigin(-0.25, this.selectBitmap.originY);
          }
        }
      });
      skinSlot.on('pointerover', (pointer) => {});
      this.skinSlots.push(skinSlot);

      const playerSkin = this.add
        .spine(startX + i * (size + margin), startY + 40, 'hero', 'idle', true)
        .setScale(1)
        .setDepth(DepthGroup.front)
        .setInteractive()
        .setSkinByName(this.skins[i].name);
      this.playerSkins.push(playerSkin);
    }
  }

  async getData() {
    const equippedSkinName = getEquippedSkinName();

    if (equippedSkinName) {
      this.equippedSkinName = equippedSkinName;

      const index = this.skins.findIndex((s) => s.name === this.equippedSkinName);

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

  private updateNftOwnership(tokens: any[]) {
    console.log('NFTs:', tokens);
    tokens.forEach((token) => {
      if (token.token_id && token.token_id.split(':')[0]) {
        const tokenSeriesId = token.token_id.split(':')[0];
        this.skins.forEach((s) => {
          if (s.seriesId === tokenSeriesId) s.isOwned = true;
        });
      }
    });
  }

  async getNftsAndUpdateOwnership() {
    nftTokensForOwner()
      .then((tokens) => {
        this.updateNftOwnership(tokens);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
