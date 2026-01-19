import type { MaybePoint, Point } from '@/WiperTool/lib/geometry';

export const PadKeys = {
  BambuLabA1: 'bbl-a1',
};

export type PadKey = (typeof PadKeys)[keyof typeof PadKeys];

export type PadProperties = {
  key: PadKey;
  name: string;
  width: number;
  height: number;
  refPointOffset: Point;
};

export const computePadTopRight = (
  pad: PadProperties,
  calibration: MaybePoint,
): Point => ({
  x: (calibration.x ?? 0) - pad.refPointOffset.x,
  y: (calibration.y ?? 0) - pad.refPointOffset.y,
});
