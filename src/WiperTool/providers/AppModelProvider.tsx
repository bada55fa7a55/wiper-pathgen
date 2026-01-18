import type { ParentProps } from 'solid-js';
import { createContext, createMemo, useContext } from 'solid-js';
import { createCalibrationStore } from '@/WiperTool/domain/calibration/store';
import { createImportsStore } from '@/WiperTool/domain/imports/store';
import { computePadTopRight, padProperties } from '@/WiperTool/domain/pads';
import { printerProperties } from '@/WiperTool/domain/printers';
import { createSettingsStore } from '@/WiperTool/domain/settings/store';
import { createWipingSequenceStore } from '@/WiperTool/domain/wipingSequence/store';
import { createModalsStore } from '@/WiperTool/ui/modals/store';
import { createSteps } from '@/WiperTool/ui/steps/readModel';
import { createTrackingStore } from '@/WiperTool/ui/tracking/store';

type Accessors<T extends object, K extends readonly (keyof T)[]> = {
  [P in K[number]]: () => T[P];
};

export function makeAccessors<T extends object, K extends readonly (keyof T)[]>(
  getState: () => T,
  keys: K,
): Accessors<T, K> {
  const out = {} as Accessors<T, K>;
  for (const k of keys) {
    (out as any)[k] = () => getState()[k];
  }
  return out;
}

function createAppModel() {
  const settings = createSettingsStore();
  const calibration = createCalibrationStore();
  const wipingSequence = createWipingSequenceStore();
  const imports = createImportsStore();
  const tracking = createTrackingStore();
  const modals = createModalsStore();

  const derived = {
    steps: createSteps({
      isPrinterSelected: () => settings.state.printer !== undefined,
      isCalibrated: calibration.derived.isComplete,
      isSettingsComplete: settings.derived.isComplete,
      isWipingSequenceComplete: wipingSequence.derived.isComplete,
    }),

    selectedPrinter: createMemo(() => printerProperties[settings.state.printer]),
    selectedPad: createMemo(() => padProperties[settings.state.padType]),
    selectedPadTopRight: createMemo(() => computePadTopRight(padProperties[settings.state.padType], calibration.state)),
  };

  const actions = {
    clearModals() {
      modals.actions.clearModals();
      imports.actions.resetWipingSequenceImport();
    },
  };

  return { calibration, settings, wipingSequence, imports, tracking, modals, derived, actions } as const;
}

type AppModel = ReturnType<typeof createAppModel>;
const AppModelContext = createContext<AppModel>();

export function AppModelProvider(props: ParentProps) {
  const model = createAppModel();
  return <AppModelContext.Provider value={model}>{props.children}</AppModelContext.Provider>;
}

export function useAppModel() {
  const ctx = useContext(AppModelContext);
  if (!ctx) throw new Error('useAppModel must be used within <AppModelProvider>');
  return ctx;
}

export function useSteps() {
  return useAppModel().derived.steps;
}

export function usePrinters() {
  const { derived } = useAppModel();
  return {
    selectedPrinter: derived.selectedPrinter,
  };
}

export function usePads() {
  const { derived } = useAppModel();
  return {
    selectedPad: derived.selectedPad,
    selectedPadTopRight: derived.selectedPadTopRight,
  };
}

export function useCalibration() {
  const { calibration } = useAppModel();

  return {
    x: () => calibration.state.x,
    y: () => calibration.state.y,
    z: () => calibration.state.z,
    ...calibration.derived,
    actions: calibration.actions,
  } as const;
}

export function useSettings() {
  const { settings } = useAppModel();

  return {
    plungeDepth: () => settings.state.plungeDepth,
    feedRate: () => settings.state.feedRate,
    zLift: () => settings.state.zLift,
    printer: () => settings.state.printer,
    padType: () => settings.state.padType,
    ...settings.derived,
    actions: settings.actions,
  } as const;
}

export function useWipingSequence() {
  const { wipingSequence } = useAppModel();

  return {
    wipingSteps: () => wipingSequence.state.wipingSequence,
    ...wipingSequence.derived,
    actions: wipingSequence.actions,
  } as const;
}

export function useImports() {
  const { imports } = useAppModel();

  return {
    wipingSequenceImport: () => imports.state.wipingSequence,
    actions: imports.actions,
  } as const;
}

export function useTracking() {
  const { tracking } = useAppModel();

  return {
    lastWipingSequenceWrite: () => tracking.state.lastWipingSequenceWrite,
    actions: tracking.actions,
  } as const;
}

export function useModals() {
  const { modals } = useAppModel();

  return {
    ...modals.derived,
    ...modals.queries,
    actions: modals.actions,
  } as const;
}
