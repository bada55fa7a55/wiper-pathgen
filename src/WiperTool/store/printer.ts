import { printerProperties } from 'WiperTool/configuration';
import { createMemo } from 'solid-js';
import { settings } from './settings';

export const printer = createMemo(() => {
  if (!printerProperties[settings.printer]) {
    throw new Error('Unsupported printer');
  }
  return printerProperties[settings.printer];
});
