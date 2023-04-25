import { Scene } from 'phaser';
import svgToPhaserPath from 'svg-to-phaser-path';

import { BodyTypeLabel } from '~/enums/BodyTypeLabel';
import { getGameState } from '~/gameState';
import { Box } from '~/gameobjects/Box';
import { Door } from '~/gameobjects/Door';
import { SpinningBar } from '~/gameobjects/SpinningBar';
import { StoreBooth } from '~/gameobjects/StoreBooth';
import { TimeCapsule } from '~/gameobjects/TimeCapsule';
import { SvgPath } from '~/types/SvgPath';
import { SvgPathAttributes } from '~/types/SvgPathAttributes';

export const getPosFromSvgCircle = (circleElement: SVGElement): Phaser.Math.Vector2 => {
  if (!circleElement) return new Phaser.Math.Vector2(0, 0);
  const cx = circleElement.getAttribute('cx');
  const cy = circleElement.getAttribute('cy');
  if (!cx || !cy) return null;
  return new Phaser.Math.Vector2(~~cx, ~~cy);
};

export const getPosFromSvgRect = (svgEl: SVGElement): Phaser.Math.Vector2 => {
  let x = svgEl.getAttribute('x');
  let y = svgEl.getAttribute('y');
  if (x.match('px')) x = x.split('px')[0];
  if (y.match('px')) y = y.split('px')[0];
  if (!x || !y) return null;
  return new Phaser.Math.Vector2(~~x, ~~y);
};
export const getHeightFromSvgRect = (svgEl: SVGElement): number => {
  let height = svgEl.getAttribute('height');

  if (height.match('px')) height = height.split('px')[0];
  if (!height) return 0;
  return ~~height;
};
export const createPathsFromSvg = (svgDoc: Document): SvgPath[] => {
  const svgPaths: SvgPath[] = [];
  const pathEls = svgDoc.querySelectorAll('path');

  pathEls.forEach((el) => {
    const jsonPath = svgToPhaserPath(el.getAttribute('d'));
    const path = new Phaser.Curves.Path(jsonPath);
    const color: number = rgbTohex(el.style.stroke);
    const fill: number = rgbTohex(el.style.fill);
    const attributes: SvgPathAttributes = {};
    // TODO (johnedvard) move to seperater function

    if (
      el.getAttribute('serif:id')?.match('{parallax-') ||
      el.parentElement.getAttribute('serif:id')?.match('{parallax-')
    ) {
      const parallaxType =
        el.getAttribute('serif:id')?.split('{parallax-')[1]?.split('}')[0] ||
        el.parentElement.getAttribute('serif:id')?.split('{parallax-')[1]?.split('}')[0];
      if (parallaxType === 'back') {
        attributes.isParallaxBack = true;
      } else if (parallaxType === 'front') {
        attributes.isParallaxFront = true;
      }
    }
    svgPaths.push({ path, svgPathEl: el, strokeWidth: getStrokeWidth(el), color, fill, attributes });
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

export const createTextFromSvg = (scene: Scene, svgDoc: Document) => {
  const textelements = svgDoc.querySelectorAll('text');

  for (let el of textelements) {
    // TODO (johnedvard) deal with attributes not containing 'px'
    const x = ~~el.getAttribute('x').split('px')[0];
    const y = ~~el.getAttribute('y').split('px')[0];
    const fontSize = ~~el.style.fontSize.split('px')[0];
    let textValue = el.innerHTML;
    textValue = textValue.replace(/<[^>]+>/g, '');
    const bitmapText = scene.add.bitmapText(x, y, 'atari', textValue, fontSize).setAlpha(1).setOrigin(0.2, 0.6);
    bitmapText.setTint(0x000000);
  }
};
export const createSpinningBarsFromSvg = (scene: Scene, svgDoc: Document): SpinningBar[] => {
  const spinningObjectEls = svgDoc.querySelectorAll('circle');
  const bars: SpinningBar[] = [];
  for (let el of spinningObjectEls) {
    if (el.getAttribute('serif:id')?.match('{spinningBar}')) {
      const pos = getPosFromSvgCircle(el);
      let isSafe = false;
      if (el.getAttribute('serif:id')?.match('{safe}')) isSafe = true;
      bars.push(new SpinningBar(scene, { pos, isSafe }));
    }
  }
  return bars;
};

export const createStoreBoothFromSvg = (scene: Scene, svgDoc: Document): StoreBooth => {
  const storeBoothEl: SVGElement = svgDoc.querySelector(`#storeBooth`);
  if (storeBoothEl) {
    const pos = getPosFromSvgCircle(storeBoothEl);
    return new StoreBooth(scene, { pos });
  }
};

export const createDoorsFromSvg = (scene: Scene, svgDoc: Document): Door[] => {
  const doorEls = svgDoc.querySelectorAll('circle');
  const doors: Door[] = [];
  for (let el of doorEls) {
    if (el.getAttribute('serif:id')?.match('{door}')) {
      let isGoal = false;
      let canUnlock = false;
      let numCapsules = 0;
      const pos = getPosFromSvgCircle(el);
      let goToLevelId = '';
      if (el.getAttribute('serif:id').match('{to-')) {
        goToLevelId = el.getAttribute('serif:id').split('{to-')[1].split('}')[0];
      }
      if (el.getAttribute('serif:id').match('{goal}')) {
        isGoal = true;
      }
      if (el.getAttribute('serif:id').match('{numCapsules-')) {
        const numCapsulesStr = el.getAttribute('serif:id').split('{numCapsules-')[1].split('}')[0];
        numCapsules = parseInt(numCapsulesStr);
      }
      if (goToLevelId === 'level1' || goToLevelId === 'leveltutorial') {
        canUnlock = true;
      }

      doors.push(new Door(scene, { pos, goToLevelId, isGoal, canUnlock, numCapsules }));
    }
  }
  return doors;
};

export const createTimeCapsulesFromSvg = (scene: Scene, svgDoc: Document): TimeCapsule[] => {
  const doorEls = svgDoc.querySelectorAll('circle');
  const capsules: TimeCapsule[] = [];
  for (let el of doorEls) {
    if (el.getAttribute('serif:id')?.match('{timeCapsule}')) {
      const pos = getPosFromSvgCircle(el);
      capsules.push(new TimeCapsule(scene, { pos }));
    }
  }
  return capsules;
};
export const createBoxesFromSvg = (scene: Scene, svgDoc: Document): Box[] => {
  const rectElements = svgDoc.querySelectorAll('rect');
  const boxes = [];
  for (let el of rectElements) {
    if (!el.getAttribute('serif:id')?.match('{box}')) continue;
    const pos = getPosFromSvgRect(el);
    const height = getHeightFromSvgRect(el);
    boxes.push(new Box(scene, { pos, height, width: height }));
  }
  return boxes;
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
