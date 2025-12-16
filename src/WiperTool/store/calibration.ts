import { createMemo } from 'solid-js';
import { createLocalStorageStore } from './createLocalStorageStore';

const CALIBRATION_VERSION = 'v1';

type Calibration = {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
};

export const [calibration, setCalibration] = createLocalStorageStore<Calibration>(
  `app-calibration-${CALIBRATION_VERSION}`,
  {
    x: undefined,
    y: undefined,
    z: undefined,
  },
);

export const isCalibrated = createMemo(
  () => calibration.x !== undefined && calibration.y !== undefined && calibration.z !== undefined,
);
