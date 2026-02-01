import type { Point } from '@/WiperTool/lib/geometry';
import type { CartesianRect } from '@/WiperTool/lib/rect';

export const PrinterKeys = {
  PrusaCoreOne: 'prusa-core-one',
  PrusaCoreOneL: 'prusa-core-onel',
  PrusaXl: 'prusa-xl',
  PrusaMk4: 'prusa-mk4',
} as const;

export type PrinterKey = (typeof PrinterKeys)[keyof typeof PrinterKeys];

export type PrinterProperties = {
  key: PrinterKey;
  name: string;
  printerId: string;
  bounds: CartesianRect;
  originalCleaningGCode: string;
  parkingZHeight: number;
  parkingCoords: Point;
  buildVolume: { x: number; y: number; z: number };
  status: 'supported' | 'in-progress' | 'planned';
};
