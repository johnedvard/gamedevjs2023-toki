import { SvgPathAttributes } from './SvgPathAttributes';

export type SvgPath = {
  svgPathEl: SVGElement;
  path: Phaser.Curves.Path;
  strokeWidth: number;
  color?: number;
  fill?: number;
  attributes?: SvgPathAttributes;
};
