import type { PrinterKey } from '@/WiperTool/domain/printers';
import { PrinterKeys } from '@/WiperTool/domain/printers';
import mk52BedSvg from './assets/mk52-bed.svg?url';

export type BedImage = {
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
};

export const bedImages: Partial<Record<PrinterKey, BedImage>> = {
  [PrinterKeys.PrusaCoreOne]: {
    x: -2000,
    y: -14000,
    width: 254000,
    height: 256000,
    src: mk52BedSvg,
  },
  [PrinterKeys.PrusaMk4]: {
    x: -2000,
    y: -24000,
    width: 254000,
    height: 256000,
    src: mk52BedSvg,
  },
};
