import { createMemo } from 'solid-js';
import { createLocalStorageStore } from '@/WiperTool/lib/createLocalStorageStore';
import type { Point, Point3D } from '@/WiperTool/lib/geometry';

const CALIBRATION_VERSION = 'v1';

type CalibrationState = {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
};

export function createCalibrationStore() {
  const initialState: CalibrationState = {
    x: undefined,
    y: undefined,
    z: undefined,
  };

  const [state, set] = createLocalStorageStore<CalibrationState>(
    `app-calibration-${CALIBRATION_VERSION}`,
    initialState,
  );

  const actions = {
    setCalibration: set,
  };

  const derived = {
    isComplete: createMemo(() => state.x !== undefined && state.y !== undefined && state.z !== undefined),
    calibrationPoint: createMemo((): Point | undefined =>
      state.x !== undefined && state.y !== undefined ? { x: state.x, y: state.y } : undefined,
    ),
    calibrationPoint3D: createMemo((): Point3D | undefined =>
      state.x !== undefined && state.y !== undefined && state.z !== undefined
        ? { x: state.x, y: state.y, z: state.z }
        : undefined,
    ),
  };

  return { state, actions, derived } as const;
}
