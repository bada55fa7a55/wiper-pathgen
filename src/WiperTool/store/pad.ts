import { padProperties } from 'WiperTool/configuration';
import { createMemo } from 'solid-js';
import { calibration } from './calibration';
import { settings } from './settings';

const computePadTopRight = (
  pad: { refPointOffsetX: number; refPointOffsetY: number },
  calib: {
    x: number | undefined;
    y: number | undefined;
  },
) => ({
  x: (calib.x ?? 0) - pad.refPointOffsetX,
  y: (calib.y ?? 0) - pad.refPointOffsetY,
});

export const pad = createMemo(() => {
  if (!padProperties[settings.padType]) {
    throw new Error('Unsupported pad type');
  }
  return padProperties[settings.padType];
});

/** Actual top right corner of the silicone pad */
export const padTopRight = createMemo(() => computePadTopRight(pad(), calibration));
