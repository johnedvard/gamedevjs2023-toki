import { SceneKey } from '~/enums/SceneKey';

export class Boot extends Phaser.Scene {
  // TODO (johnedvard) use an asset loader and constants for the names
  preload(): void {
    this.load.bitmapFont('atari', 'bitmap/atari-classic.png', 'bitmap/atari-classic.xml');
    this.preloadSpineAnimations();
  }

  preloadSpineAnimations() {}

  create(): void {
    this.setPixelArtFilterOnAssets();
    this.createAnimations();
    // TODO (johnedvard) start desired scene based on env build variable?
    this.scene.start(SceneKey.MainMenu);
    // this.scene.start(SceneKey.NewGameIntro);
    // this.scene.start(SceneKey.Preload);
  }

  createAnimations() {}

  setPixelArtFilterOnAssets() {
    // Remember to set FilterMode.NEAREST for pixel art (to prevent anti-alias when scaling up)
    // this.textures.get('animatino').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
