import { Scene } from 'phaser';

// TODO (johnedvard) Maybe make this file a class in order to have a unique emitter for other game objects too
let emitter: Phaser.GameObjects.Particles.ParticleEmitter;
export const emitDustParticles = (scene: Scene, x: number, y: number) => {
  if (emitter) return;
  const maxLiveTime = 50;
  let ellapsedTime = 0;

  emitter = scene.add.particles(0, 0, 'particle', {
    emitZone: { source: new Phaser.Geom.Circle(x, y, 10), type: 'random' },
    lifespan: { min: 400, max: 500 },
    scale: { start: 1, end: 0.3 },
    alpha: { start: 0, end: 1, steps: 5 },
    quantity: 1,
    frequency: 25,
  });
  emitter.start();

  const gameUpdateListener = (time: number, delta: number) => {
    ellapsedTime += delta;
    if (ellapsedTime >= maxLiveTime) {
      if (emitter.active) {
        emitter.stop();
        emitter = null;
      }
      scene.events.off(Phaser.Scenes.Events.UPDATE, gameUpdateListener);
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, gameUpdateListener);
};
