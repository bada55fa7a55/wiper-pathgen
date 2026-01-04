import type { PrinterKey } from 'WiperTool/configuration';
import { defaultPrinterKey, PadKey } from 'WiperTool/configuration';
import { createMemo } from 'solid-js';
import { createLocalStorageStore } from './createLocalStorageStore';

const SETTINGS_VERSION = 'v1';

type Settings = {
  plungeDepth: number | undefined;
  feedRate: number | undefined;
  zLift: number | undefined;
  printer: PrinterKey;
  padType: PadKey;
};

export const [settings, setSettings] = createLocalStorageStore<Settings>(`app-settings-${SETTINGS_VERSION}`, {
  plungeDepth: 500,
  feedRate: 10000,
  zLift: 4000,
  printer: defaultPrinterKey,
  padType: PadKey.BambuLabA1,
});

export const isSettingsComplete = createMemo(
  () => settings.plungeDepth !== undefined && settings.feedRate !== undefined && settings.zLift !== undefined,
);
