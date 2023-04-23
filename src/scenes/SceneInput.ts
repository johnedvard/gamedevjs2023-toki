import { Input, Scene } from 'phaser';
import { ControllerEvent } from '~/enums/ControllerEvent';
import { emit } from '~/utils/eventEmitterUtils';
import { gamepadIndex, leftstick } from '~/utils/gamepadUtils';

/**
 * Launch this scene once for every game, and all input will be handled by this this.
 * Send events for gameobjects to react to
 */
export class SceneInput extends Scene {
  keyboards: Record<string, Record<string, Phaser.Input.Keyboard.Key>> = {};
  gamepads: Record<string, Input.Gamepad.Gamepad> = {};

  create(data: any) {
    this.createKeyboardControl();
    this.createGamepadControl();
    this.createMouseControl();
  }
  update(time: number, delta: number): void {
    this.updateKeyboardControls();
    this.updateGamepadControls();
  }

  createMouseControl = () => {
    this.input.mouse.disableContextMenu();
    this.handleMouseControl();
  };

  handleMouseControl = () => {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.primaryDown) {
        const pos = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
        emit(ControllerEvent.action, { pos });
      }
    });
  };

  createKeyboardControl = () => {
    const keyboard: Record<string, Phaser.Input.Keyboard.Key> = this.input.keyboard.createCursorKeys();
    keyboard.KeyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyboard.KeyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyboard.KeyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyboard.KeyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyboards[this.scene.key] = keyboard;
    this.handleKeyboardListener();
  };

  handleKeyboardListener = () => {
    this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
      switch (evt?.code) {
        case 'KeyE':
          const pos = new Phaser.Math.Vector2(this.input.activePointer.worldX, this.input.activePointer.worldY);
          emit(ControllerEvent.action, { pos });
          break;
        case 'Space':
          emit(ControllerEvent.jump);
          break;
        case 'KeyI':
          emit(ControllerEvent.inventory);
          break;
        case 'KeyW':
        case 'ArrowUp':
          emit(ControllerEvent.up);
          break;
      }
    });
  };

  handleGamepaddListener = () => {
    this.input.gamepad.on('down', (_pad: Input.Gamepad.Gamepad, button: Input.Gamepad.Button) => {
      switch (button.index) {
        case gamepadIndex.west:
          emit(ControllerEvent.action);
          break;
        case gamepadIndex.south:
          emit(ControllerEvent.jump);
          break;
        case gamepadIndex.north:
          emit(ControllerEvent.inventory);
          break;
        case gamepadIndex.up:
          emit(ControllerEvent.up);
          break;
      }
    });
  };

  // TODO (johnedvard) support more controls for each scene
  // TODO (johnedvard) try to connect control again if it was plugged in later
  createGamepadControl = () => {
    if (!this.gamepads[this.scene.key] && this.input.gamepad.getPad(0)) {
      this.gamepads[this.scene.key] = this.input.gamepad?.getPad(0);
      this.handleGamepaddListener();
    }
  };

  updateKeyboardControls = (): boolean => {
    const keyboard = this.keyboards[this.scene.key];
    if (!keyboard) return;
    const velocity = { x: 0, y: 0 };

    if (keyboard.left.isDown || keyboard.KeyA.isDown) velocity.x = -1;
    if (keyboard.right.isDown || keyboard.KeyD.isDown) velocity.x = 1;
    if (keyboard.up.isDown || keyboard.KeyW.isDown) velocity.y = -1;
    if (keyboard.down.isDown || keyboard.KeyS.isDown) velocity.y = 1;

    emit(ControllerEvent.move, { velocity });
  };

  updateGamepadControls = (): void => {
    const gamepad = this.gamepads[this.scene.key];
    if (!gamepad) {
      // maybe gamepad was connected while in-game. Try to create again
      this.createGamepadControl();
      return;
    }

    const deadZone = 0.1; // prevent gamepad from moving when thumbstick is close to 0
    const velocity = { x: gamepad.axes[leftstick.x].getValue(), y: gamepad.axes[leftstick.y].getValue() };

    if (gamepad.isButtonDown(gamepadIndex.dpadleft)) velocity.x = -1;
    if (gamepad.isButtonDown(gamepadIndex.dpadright)) velocity.x = 1;
    if (gamepad.isButtonDown(gamepadIndex.dpadup)) velocity.y = -1;
    if (gamepad.isButtonDown(gamepadIndex.dpaddown)) velocity.y = 1;

    const isDeadzone = Math.abs(velocity.x) <= deadZone || Math.abs(velocity.y) <= deadZone;
    if (!isDeadzone) {
      emit(ControllerEvent.move, { velocity });
    }
  };
}
