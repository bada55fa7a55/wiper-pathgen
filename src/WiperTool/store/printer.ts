import { defaultPrinterKey, printerProperties } from 'WiperTool/configuration';
import { createMemo } from 'solid-js';
import { settings } from './settings';

export const printer = createMemo(() => {
  const configuredKey = settings.printer;
  const fallbackKey = printerProperties[configuredKey] ? configuredKey : defaultPrinterKey;
  const printer = printerProperties[fallbackKey];

  if (!printer) {
    throw new Error('Unsupported printer');
  }

  return printer;
});
