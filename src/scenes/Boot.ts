import { SceneKey } from '~/enums/SceneKey';
import { loadGame } from '~/gameState';
import { initMusicAndSfx, playMusic } from '~/utils/soundUtils';

export class Boot extends Phaser.Scene {
  // TODO (johnedvard) use an asset loader and constants for the names
  preload(): void {
    this.load.bitmapFont('atari', 'bitmap/atari-classic.png', 'bitmap/atari-classic.xml');
    this.preloadSpineAnimations();
    this.loadMusic();
  }

  preloadSpineAnimations() {
    this.load.image('hero', 'spine/hero.png');
    this.load.spine('hero', 'spine/hero.json', ['spine/hero.atlas'], true);
    this.load.image('box', 'spine/box.png');
    this.load.spine('box', 'spine/box.json', ['spine/box.atlas'], true);
    this.load.image('spinningBar', 'spine/spinningBar.png');
    this.load.spine('spinningBar', 'spine/spinningBar.json', ['spine/spinningBar.atlas'], true);
    this.load.image('storeBooth', 'spine/storeBooth.png');
    this.load.spine('storeBooth', 'spine/storeBooth.json', ['spine/storeBooth.atlas'], true);
    this.load.image('storeInterface', 'spine/storeInterface.png');
    this.load.spine('storeInterface', 'spine/storeInterface.json', ['spine/storeInterface.atlas'], true);
    this.load.image('skinSlot', 'spine/skinSlot.png');
    this.load.spine('skinSlot', 'spine/skinSlot.json', ['spine/skinSlot.atlas'], true);
    this.load.image('overlord', 'spine/overlord.png');
    this.load.spine('overlord', 'spine/overlord.json', ['spine/overlord.atlas'], true);
    this.load.image('storeSpeechBubble', 'spine/storeSpeechBubble.png');
    this.load.spine('storeSpeechBubble', 'spine/storeSpeechBubble.json', ['spine/storeSpeechBubble.atlas'], true);
    this.load.image('sageFloating', 'spine/sageFloating.png');
    this.load.spine('sageFloating', 'spine/sageFloating.json', ['spine/sageFloating.atlas'], true);
    this.load.image('door', 'spine/door.png');
    this.load.spine('door', 'spine/door.json', ['spine/door.atlas'], true);
    this.load.image('timeCapsule', 'spine/timeCapsule.png');
    this.load.spine('timeCapsule', 'spine/timeCapsule.json', ['spine/timeCapsule.atlas'], true);

    this.load.image('particle', 'spine/particle.png');
    this.load.image('sage', 'spine/sage.png');
  }

  loadMusic() {
    this.load.audio('backgroundMusic', 'music/background music.mp3');
    this.load.audio('lockObject', 'music/lock object.mp3');
    this.load.audio('unlockObject', 'music/unlock object.mp3');
    this.load.audio('dead', 'music/dead.mp3');
    this.load.audio('hourGlass', 'music/hourglass.mp3');
    this.load.audio('laserBeam', 'music/laser beam.mp3');
    this.load.audio('store', 'music/store.mp3');
    this.load.audio('unlock', 'music/unlock.mp3');
  }
  create(): void {
    this.setPixelArtFilterOnAssets();
    this.createAnimations();

    // TODO (johnedvard) start desired scene based on env build variable?
    // this.scene.start(SceneKey.Level);
    // this.scene.start(SceneKey.NewGameIntro);

    initMusicAndSfx(this);
    playMusic();

    this.scene.start(SceneKey.MainMenu);
  }

  createAnimations() {}

  setPixelArtFilterOnAssets() {
    // Remember to set FilterMode.NEAREST for pixel art (to prevent anti-alias when scaling up)
    // this.textures.get('animatino').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
