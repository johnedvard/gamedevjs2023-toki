import { Scene } from 'phaser';

export class UserInterface extends Scene {
  create(data: any) {
    // Add UI elements
    this.add.text(10, 10, `Create User interface`, { font: '56px Arial' });

    this.sys.events.on('stop', function (data) {
      // perform any other necessary actions here
    });
  }
}
