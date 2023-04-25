import { Scene } from 'phaser';

let isMusicOn = true;
let isSfxOn = true;

let backgroundMusic;
let lockObject;
let unlockObject;
let dead;
let hourGlass;
let laserBeam;
let store;
let unlock;

export const initMusicAndSfx = (scene: Scene) => {
  backgroundMusic = scene.sound.add('backgroundMusic', { loop: true });
  lockObject = scene.sound.add('lockObject');
  unlockObject = scene.sound.add('unlockObject');
  dead = scene.sound.add('dead');
  hourGlass = scene.sound.add('hourGlass');
  laserBeam = scene.sound.add('laserBeam');
  store = scene.sound.add('store');
  unlock = scene.sound.add('unlock');
};

export const toggleMusic = () => {
  isMusicOn = !isMusicOn;
  if (!isMusicOn) {
    backgroundMusic?.pause();
  } else {
    backgroundMusic?.resume();
  }
};

export const playLockObject = () => {
  if (!isSfxOn) return;
  lockObject?.play();
};

export const playUnLockObject = () => {
  if (!isSfxOn) return;
  unlockObject?.play();
};

export const toggleSfx = () => {
  isSfxOn = !isSfxOn;
};

export const playTimeCapsulePickup = () => {
  if (!isSfxOn) return;
  hourGlass?.play();
};

export const playDeadSound = () => {
  if (!isSfxOn) return;
  dead?.play();
};

export const playStoreSound = () => {
  if (!isSfxOn) return;
  store?.play();
};

export const playLaserBeam = () => {
  if (!isSfxOn) return;
  laserBeam?.play();
};

export const playUnlockDoor = () => {
  if (!isSfxOn) return;
  unlock?.play();
};

export const playMusic = () => {
  backgroundMusic?.play();
  if (!isMusicOn) backgroundMusic?.pause();
};
