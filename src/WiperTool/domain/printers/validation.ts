import type { PrinterKey } from './model';
import { PrinterKeys } from './model';

export function isPrinterKey(value: unknown): value is PrinterKey {
  return Object.values(PrinterKeys).includes(value as PrinterKey);
}
