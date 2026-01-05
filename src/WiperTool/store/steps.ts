import { createMemo } from 'solid-js';
import { isCalibrated } from './calibration';
import { isSettingsComplete, settings } from './settings';
import { getWipingStepPoints, wipingSequence } from './wipingSequence';

export const StepKey = {
  SelectPrinter: 'select-printer',
  Calibration: 'calibration',
  Settings: 'settings',
  Drawing: 'drawing',
  Testing: 'testing',
} as const;

export type StepKey = (typeof StepKey)[keyof typeof StepKey];

const isPrinterSelected = createMemo(() => settings.printer !== undefined);

const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence()));
const isDrawingComplete = () => sequencePoints().length >= 2;

const stepOrder: StepKey[] = [
  StepKey.SelectPrinter,
  StepKey.Calibration,
  StepKey.Settings,
  StepKey.Drawing,
  StepKey.Testing,
];

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
    [StepKey.Testing]: {
      key: StepKey.Testing,
      label: 'Testing',
      anchor: 'testing',
      isComplete: false,
    },
  };
});

export const areStepsCompleteUpTo = (targetStep: StepKey) => {
  const currentSteps = steps();
  for (const stepKey of stepOrder) {
    if (stepKey === targetStep) {
      return true;
    }
    const step = currentSteps[stepKey];
    if (!step.isComplete) {
      return false;
    }
  }
  return false;
};
