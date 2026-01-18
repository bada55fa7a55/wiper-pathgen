import type { Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import type { Step, StepKey } from './model';
import { StepKeys, stepOrder } from './model';

type Inputs = {
  isPrinterSelected: Accessor<boolean>;
  isCalibrated: Accessor<boolean>;
  isSettingsComplete: Accessor<boolean>;
  isWipingSequenceComplete: Accessor<boolean>;
};

export function createSteps(inputs: Inputs) {
  const steps = createMemo<Record<string, Step>>(() => ({
    [StepKeys.SelectPrinter]: {
      key: StepKeys.SelectPrinter,
      label: 'Select printer',
      anchor: 'hwsetup',
      isComplete: inputs.isPrinterSelected(),
    },
    [StepKeys.Calibration]: {
      key: StepKeys.Calibration,
      label: 'Calibration',
      anchor: 'calibration',
      isComplete: inputs.isCalibrated(),
    },
    [StepKeys.Settings]: {
      key: StepKeys.Settings,
      label: 'Settings',
      anchor: 'settings',
      isComplete: inputs.isSettingsComplete(),
    },
    [StepKeys.Drawing]: {
      key: StepKeys.Drawing,
      label: 'Draw wiping path',
      anchor: 'drawing',
      isComplete: inputs.isWipingSequenceComplete(),
    },
    [StepKeys.Testing]: {
      key: StepKeys.Testing,
      label: 'Testing',
      anchor: 'testing',
      isComplete: false,
    },
  }));

  const areStepsCompleteUpTo = (targetStep: StepKey) => {
    const current = steps();
    for (const key of stepOrder) {
      if (key === targetStep) return true;
      if (!current[key].isComplete) return false;
    }
    return true;
  };

  return { steps, areStepsCompleteUpTo } as const;
}
