import { printerProperties } from './catalog';
import type { PrinterKey } from './model';

export function getPrinterPropertiesByKey(key: PrinterKey) {
  return printerProperties[key];
}
