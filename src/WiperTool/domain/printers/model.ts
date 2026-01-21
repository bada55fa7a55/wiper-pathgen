import type { Point } from '@/WiperTool/lib/geometry';
import type { CartesianRect } from '@/WiperTool/lib/rect';

export const PrinterKeys = {
  PrusaCoreOne: 'prusa-core-one',
  PrusaCoreOneL: 'prusa-core-onel',
  PrusaXl: 'prusa-xl',
  PrusaMk4: 'prusa-mk4',
} as const;

export type PrinterKey = (typeof PrinterKeys)[keyof typeof PrinterKeys];

export type PrinterBedShape = {
  path: [number, number][];
  offset: [number, number];
  negativeVolumes: {
    type: 'circle';
    x: number;
    y: number;
    radius: number;
  }[];
};

export type PrinterProperties = {
  key: PrinterKey;
  name: string;
  printerId: string;
  bounds: CartesianRect;
  originalCleaningGCode: string;
  parkingZHeight: number;
  parkingCoords: Point;
  bedShape?: PrinterBedShape;
  status: 'supported' | 'in-progress' | 'planned';
};
