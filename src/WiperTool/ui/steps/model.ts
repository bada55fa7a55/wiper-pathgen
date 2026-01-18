export const StepKeys = {
  SelectPrinter: 'select-printer',
  Calibration: 'calibration',
  Settings: 'settings',
  Drawing: 'drawing',
  Testing: 'testing',
} as const;

export type StepKey = (typeof StepKeys)[keyof typeof StepKeys];

export type Step = {
  key: StepKey;
  label: string;
  anchor: string;
  isComplete: boolean;
};

export const stepOrder: StepKey[] = [
  StepKeys.SelectPrinter,
  StepKeys.Calibration,
  StepKeys.Settings,
  StepKeys.Drawing,
  StepKeys.Testing,
];
