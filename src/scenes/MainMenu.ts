import { Input, GameObjects } from 'phaser';
import { gamepadIndex } from '~/utils/gamepadUtils';
import { displayMainMenuItems, highlightSelectedMenu } from '~/menu';

export class MainMenu extends Phaser.Scene {
  selectedMenuIndex = 0;
  menuItems: { txt: GameObjects.BitmapText; sceneName: string }[];
  constructor() {
    super('MainMenu');
  }

  setPrevMenuIndex() {
    const nextIndex = this.selectedMenuIndex - 1;
    if (nextIndex < 0) this.selectedMenuIndex = this.menuItems.length - 1;
    else this.selectedMenuIndex = nextIndex;
  }

  setNextMenuIndex() {
    const nextIndex = this.selectedMenuIndex + 1;
    if (nextIndex >= this.menuItems.length) this.selectedMenuIndex = 0;
    else this.selectedMenuIndex = nextIndex;
  }

  selectMenu(index: number) {
    const sceneName = this.menuItems[index].sceneName;
    this.scene.start(sceneName);
  }

  listenForInput() {
    this.input.gamepad.on('down', (_pad: Input.Gamepad.Gamepad, button: Input.Gamepad.Button) => {
      switch (button.index) {
        case gamepadIndex.dpadup:
          this.setPrevMenuIndex();
          break;
        case gamepadIndex.dpaddown:
          this.setNextMenuIndex();
          break;
      }
    });

    this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
      switch (evt?.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.setPrevMenuIndex();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.setNextMenuIndex();
          break;
        case 'Enter':
        case 'Space':
          this.selectMenu(this.selectedMenuIndex);
          break;
      }
    });
  }

  create(): void {
    this.menuItems = displayMainMenuItems(this);
    this.listenForInput();
  }

  update(time: number, delta: number): void {
    highlightSelectedMenu(this, delta, { index: this.selectedMenuIndex });
  }
}
