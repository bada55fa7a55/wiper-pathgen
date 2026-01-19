export const PadKeys = {
  BambuLabA1: 'bbl-a1',
};

export type PadKey = (typeof PadKeys)[keyof typeof PadKeys];

export type PadProperties = {
  key: PadKey;
  name: string;
  width: number;
  height: number;
  image: string;
  refPointOffsetX: number;
  refPointOffsetY: number;
};

export const computePadTopRight = (
  pad: {
    refPointOffsetX: number;
    refPointOffsetY: number;
  },
  calibration: {
    x: number | undefined;
    y: number | undefined;
  },
) => ({
  x: (calibration.x ?? 0) - pad.refPointOffsetX,
  y: (calibration.y ?? 0) - pad.refPointOffsetY,
});
