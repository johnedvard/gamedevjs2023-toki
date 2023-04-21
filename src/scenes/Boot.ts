import { SceneKey } from '~/enums/SceneKey';

export class Boot extends Phaser.Scene {
  // TODO (johnedvard) use an asset loader and constants for the names
  preload(): void {
    this.load.bitmapFont('atari', 'bitmap/atari-classic.png', 'bitmap/atari-classic.xml');
    this.preloadSpineAnimations();
  }

  preloadSpineAnimations() {
    this.load.image('hero', 'spine/hero.png');
    this.load.spine('hero', 'spine/hero.json', ['spine/hero.atlas'], true);
    this.load.image('box', 'spine/box.png');
    this.load.spine('box', 'spine/box.json', ['spine/box.atlas'], true);
    this.load.image('spinningBar', 'spine/spinningBar.png');
    this.load.spine('spinningBar', 'spine/spinningBar.json', ['spine/spinningBar.atlas'], true);
  }

  create(): void {
    this.setPixelArtFilterOnAssets();
    this.createAnimations();
    // TODO (johnedvard) start desired scene based on env build variable?
    this.scene.start(SceneKey.Level);
    // this.scene.start(SceneKey.NewGameIntro);
    // this.scene.start(SceneKey.Preload);
  }

  createAnimations() {}

  setPixelArtFilterOnAssets() {
    // Remember to set FilterMode.NEAREST for pixel art (to prevent anti-alias when scaling up)
    // this.textures.get('animatino').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
