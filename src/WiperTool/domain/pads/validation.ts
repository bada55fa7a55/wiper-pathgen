import type { PadKey } from './model';
import { PadKeys } from './model';

export function isPadKey(value: unknown): value is PadKey {
  return Object.values(PadKeys).includes(value as PadKey);
}
