import { SceneKey } from '~/enums/SceneKey';

export class NextLevel extends Phaser.Scene {
  create({ levelId }: { levelId: string }) {
    this.scene.start(SceneKey.Level, { levelId });
  }
}
