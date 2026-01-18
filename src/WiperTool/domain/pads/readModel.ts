import { padProperties } from './catalog';
import type { PadKey } from './model';

export function getPadPropertiesByKey(key: PadKey) {
  return padProperties[key];
}
