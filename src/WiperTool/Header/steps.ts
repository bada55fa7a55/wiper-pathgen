import { getWipingStepPoints, isCalibrated, isSettingsComplete, settings, wipingSequence } from 'WiperTool/store';
import { createMemo } from 'solid-js';

export const StepKey = {
  SelectPrinter: 'select-printer',
  Calibration: 'calibration',
  Settings: 'settings',
  Drawing: 'drawing',
} as const;

export type StepKey = (typeof StepKey)[keyof typeof StepKey];

const isPrinterSelected = createMemo(() => settings.printer !== undefined);

const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence()));
const isDrawingComplete = () => sequencePoints().length >= 2;

export const steps = createMemo(() => {
  return {
    [StepKey.SelectPrinter]: {
      key: StepKey.SelectPrinter,
      label: 'Select printer',
      anchor: 'hwsetup',
      isComplete: isPrinterSelected(),
    },
    [StepKey.Calibration]: {
      key: StepKey.Calibration,
      label: 'Calibration',
      anchor: 'calibration',
      isComplete: isCalibrated(),
    },
    [StepKey.Settings]: {
      key: StepKey.Settings,
      label: 'Settings',
      anchor: 'settings',
      isComplete: isSettingsComplete(),
    },
    [StepKey.Drawing]: {
      key: StepKey.Drawing,
      label: 'Draw wiping path',
      anchor: 'drawing',
      isComplete: isDrawingComplete(),
    },
  };
});
