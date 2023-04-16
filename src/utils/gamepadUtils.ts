/**
 * Reference Phaser: https://phaser.io/examples/v3/view/input/gamepad/gamepad-debug
 * Reference Kontra: https://straker.github.io/kontra/api/gamepad
 */
export const gamepadIndex: { [key: string]: number } = {
  south: 0,
  east: 1,
  west: 2,
  north: 3,
  dpadup: 12,
  dpaddown: 13,
  dpadleft: 14,
  dpadright: 15,
};

export const gamepadName: { [key: number]: string } = {
  0: 'south',
  1: 'east',
  2: 'west',
  3: 'north',
  12: 'dpadup',
  13: 'dpaddown',
  14: 'dpadleft',
  15: 'dpadright',
};

export const leftstick = { x: 0, y: 1 };
export const rightstick = { x: 2, y: 3 };
