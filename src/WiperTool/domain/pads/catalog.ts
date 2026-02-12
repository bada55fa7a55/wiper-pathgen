import type { PadKey, PadProperties } from './model';
import { PadKeys } from './model';

export const padProperties: Record<PadKey, PadProperties> = {
  [PadKeys.BambuLabP1S]: {
    key: PadKeys.BambuLabP1S,
    name: 'Bambu Lab P1S Nozzle Wiper',
    width: 14000,
    height: 6000,
    refPointOffset: {
      /** Reference point offset from right edge of pad */
      x: 0,
      /** Reference point offset from top edge of pad */
      y: 0,
    },
  },
};
