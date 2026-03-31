import type { Component, JSX } from 'solid-js';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import { PrinterKeys } from '@/WiperTool/domain/printers';
import { Mk52BedSvg } from './Mk52BedSvg';

export type BedImage = {
  x: number;
  y: number;
  width: number;
  height: number;
  Svg: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
};

export const bedImages: Partial<Record<PrinterKey, BedImage>> = {
  [PrinterKeys.PrusaCoreOne]: {
    x: -2000,
    y: -14000,
    width: 254000,
    height: 256000,
    Svg: Mk52BedSvg,
  },
  [PrinterKeys.PrusaMk4]: {
    x: -2000,
    y: -24000,
    width: 254000,
    height: 256000,
    Svg: Mk52BedSvg,
  },
};
