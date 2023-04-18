import { Scene } from 'phaser';
import svgToPhaserPath from 'svg-to-phaser-path';

import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { SvgPath } from '~/types/SvgPath';

export const getPosFromSvg = (svgDoc: Document, key: string): Phaser.Math.Vector2 => {
  const circleElement = svgDoc.querySelector(`#${key}`);

  const cx = circleElement.getAttribute('cx');
  const cy = circleElement.getAttribute('cy');
  if (!cx || !cy) return null;
  return new Phaser.Math.Vector2(~~cx, ~~cy);
};
export const createPathsFromSvg = (svgDoc: Document): SvgPath[] => {
  const svgPaths: SvgPath[] = [];
  const pathEls = svgDoc.querySelectorAll('path');

  pathEls.forEach((el) => {
    if (el.getAttribute('id') === 'tree-area') return;
    const jsonPath = svgToPhaserPath(el.getAttribute('d'));
    const path = new Phaser.Curves.Path(jsonPath);
    const color: number = rgbTohex(el.style.stroke);
    const fill: number = rgbTohex(el.style.fill);
    console.log('el.style.fill', el.style.fill);
    svgPaths.push({ path, svgPathEl: el, strokeWidth: getStrokeWidth(el), color, fill });
  });
  return svgPaths;
};

export const createCollisionBoxesFromPaths = (scene: Scene, svgPaths: SvgPath[]) => {
  const boxes = [];
  svgPaths.forEach(({ path, svgPathEl }) => {
    if (!svgPathEl.getAttribute('serif:id')?.match('{collision}')) return;
    const allPoints = path.getPoints(20);
    const offset = 25;
    for (let i = 0; i < allPoints.length - 1; i++) {
      const p0 = allPoints[i];
      const p1 = allPoints[i + 1];
      const { l0, l1 } = getParallellLine(p0, p1, offset);
      boxes.push(
        scene.matter.add.fromVertices((p1.x + p0.x) / 2, (p1.y + p0.y) / 2, [p0, l0, l1, p1], {
          isStatic: true,
          label: BodyTypeLabel.collisionWall,
          ignoreGravity: true,
          friction: 0,
          frictionStatic: 0,
        })
      );
    }
  });
  scene.matter.bounds.create(boxes);
};

// See https://stackoverflow.com/a/3627747/1471485
export const rgbTohex = (rgb: string) => {
  if (!rgb || rgb === 'none') return null;
  return parseInt(
    `0x${rgb
      .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
      .slice(1)
      .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
      .join('')}`
  );
};

export const getStrokeWidth = (svgPathEl: SVGElement) => {
  let strokeWidht = 6;
  if (!svgPathEl) return 6;
  try {
    strokeWidht = parseFloat(svgPathEl.style.strokeWidth);
  } catch (err) {
  } finally {
    return strokeWidht;
  }
};

const getParallellLine = (
  p0: Phaser.Math.Vector2,
  p1: Phaser.Math.Vector2,
  offset: number
): { l0: Phaser.Math.Vector2; l1: Phaser.Math.Vector2 } => {
  const [dx, dy] = [p0.x - p1.x, p0.y - p1.y];
  const scale = offset / (dx * dx + dy * dy) ** 0.5;
  const [ox, oy] = [-dy * scale, dx * scale];

  // parallell lines. See https://stackoverflow.com/a/63538916/1471485
  const l0 = new Phaser.Math.Vector2(ox + p0.x, oy + p0.y);
  const l1 = new Phaser.Math.Vector2(ox + p1.x, oy + p1.y);
  return { l0, l1 };
};
