import { createMemo } from 'solid-js';
import { createLocalStorageStore } from './createLocalStorageStore';

const SETTINGS_VERSION = 'v1';

type Settings = {
  plungeDepth: number | undefined;
  feedRate: number | undefined;
  zLift: number | undefined;
  printer: string;
  padType: string;
};

export const [settings, setSettings] = createLocalStorageStore<Settings>(`app-settings-${SETTINGS_VERSION}`, {
  plungeDepth: 500,
  feedRate: 10000,
  zLift: 4000,
  printer: 'prusa-core-one',
  padType: 'bbl-a1',
});

export const isSettingsComplete = createMemo(
  () => settings.plungeDepth !== undefined && settings.feedRate !== undefined && settings.zLift !== undefined,
);
