import { createMemo } from 'solid-js';
import { defaultPrinterKey } from '@/WiperTool/configuration';
import type { PadKey } from '@/WiperTool/domain/pads';
import { PadKeys } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import { createLocalStorageStore } from '@/WiperTool/lib/createLocalStorageStore';

const SETTINGS_VERSION = 'v1';

type SettingsState = {
  plungeDepth: number | undefined;
  feedRate: number | undefined;
  zLift: number | undefined;
  printer: PrinterKey;
  padType: PadKey;
};

export function createSettingsStore() {
  const initialState: SettingsState = {
    plungeDepth: 500,
    feedRate: 10000,
    zLift: 4000,
    printer: defaultPrinterKey,
    padType: PadKeys.BambuLabA1,
  };

  const [state, set] = createLocalStorageStore<SettingsState>(`app-settings-${SETTINGS_VERSION}`, initialState);

  const actions = {
    setSettings: set,
  };

  const derived = {
    isComplete: createMemo(
      () =>
        state.printer !== undefined &&
        state.padType !== undefined &&
        state.plungeDepth !== undefined &&
        state.feedRate !== undefined &&
        state.zLift !== undefined,
    ),
  };

  return { state, actions, derived } as const;
}
