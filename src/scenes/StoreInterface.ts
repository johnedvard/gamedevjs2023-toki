import { Scene } from 'phaser';
import { getEquippedSkin, getSkins, isSignedIn, login } from '~/near/nearConnection';

export class StoreInterface extends Scene {
  create(data: any) {
    // Add UI elements
    console.log('Create store UI. Fetch skins from NEAR');
    if (!isSignedIn()) {
      login();
    }

    this.getData();
    this.sys.events.on('stop', function (data) {
      // perform any other necessary actions here
    });
  }

  async getData() {
    console.log(await getSkins());
    console.log(await getEquippedSkin());
  }
}
