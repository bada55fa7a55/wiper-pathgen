import { createMemo } from 'solid-js';
import { createLocalStorageStore } from './createLocalStorageStore';

const SETTINGS_VERSION = 'v1';

type Settings = {
  plungeDepth: number | undefined;
  feedRate: number | undefined;
  printer: string;
  padType: string;
};

export const [settings, setSettings] = createLocalStorageStore<Settings>(`app-settings-${SETTINGS_VERSION}`, {
  plungeDepth: 1000,
  feedRate: 10000,
  printer: 'prusa-core-one',
  padType: 'bbl-a1',
});

export const isSettingsComplete = createMemo(
  () => settings.plungeDepth !== undefined && settings.feedRate !== undefined,
);
