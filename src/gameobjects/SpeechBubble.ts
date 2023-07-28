import { Scene, Curves } from 'phaser';
import { DepthGroup } from '~/enums/DepthGroup';

type TProps = {
  pos: Phaser.Math.Vector2;
  width: number;
  height: number;
};

export class SpeechBubble {
  graphics: Phaser.GameObjects.Graphics;
  pos: Phaser.Math.Vector2;
  width: number;
  height: number;
  path: Curves.Path;

  constructor(private scene: Scene, { pos, width, height }: TProps) {
    this.pos = pos;
    this.height = height;
    this.width = width;
    this.createSpeechBubble();
    this.graphics = this.scene.add.graphics().setDepth(DepthGroup.front);
  }

  createSpeechBubble() {
    const control1 = this.height / 10;
    const control2 = this.width / 5;
    this.path = new Curves.Path();
    let startPoint = new Phaser.Math.Vector2(this.pos.x, this.pos.y);
    let controlPoint1 = new Phaser.Math.Vector2(this.pos.x + control2, this.pos.y - control2 / 5);
    let endPoint = new Phaser.Math.Vector2(this.pos.x + this.width, this.pos.y);
    let curve = new Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);
    this.path.add(curve);

    startPoint = endPoint;
    controlPoint1 = new Phaser.Math.Vector2(endPoint.x + control1, endPoint.y + control1);
    endPoint = new Phaser.Math.Vector2(this.pos.x + this.width, this.pos.y + this.height);
    curve = new Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);
    this.path.add(curve);

    startPoint = endPoint;
    controlPoint1 = new Phaser.Math.Vector2(endPoint.x - control2, endPoint.y + control2 / 5);
    endPoint = new Phaser.Math.Vector2(this.pos.x, this.pos.y + this.height);
    curve = new Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);
    this.path.add(curve);

    startPoint = endPoint;
    controlPoint1 = new Phaser.Math.Vector2(endPoint.x - control1, endPoint.y - control1);
    endPoint = new Phaser.Math.Vector2(this.pos.x, this.pos.y);
    curve = new Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);
    this.path.add(curve);
  }
  update(time: number, delta: number) {
    this.graphics.clear();

    //  Draw the curve through the points

    this.graphics.fillStyle(0xfafbf6, 1);
    this.graphics.fillPoints(this.path.getPoints());
    this.graphics.lineStyle(13, 0x000000, 1);
    this.path.draw(this.graphics);
    this.graphics.fillStyle(0x000000, 1);
    this.path.curves.forEach((c) => {
      const p = c.getPointAt(0);
      this.graphics.fillCircle(p.x, p.y, 16);
    });
  }
}
