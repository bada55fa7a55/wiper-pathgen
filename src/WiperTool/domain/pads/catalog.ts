import type { PadKey, PadProperties } from './model';
import { PadKeys } from './model';

export const padProperties: Record<PadKey, PadProperties> = {
  [PadKeys.BambuLabA1]: {
    key: PadKeys.BambuLabA1,
    name: 'Bambu Lab A1 Nozzle Wiper',
    width: 37000,
    height: 8000,
    refPointOffset: {
      /** Reference point offset from right edge of pad */
      x: -1675,
      /** Reference point offset from top edge of pad */
      y: -1675,
    },
  },
};
