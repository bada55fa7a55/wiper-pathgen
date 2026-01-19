import { mk52BedShape } from './bedShapes/mk52BedShape';
import type { PrinterProperties } from './model';
import { PrinterKeys } from './model';

export const printerProperties: Record<string, PrinterProperties> = {
  [PrinterKeys.PrusaCoreOne]: {
    key: PrinterKeys.PrusaCoreOne,
    name: 'Prusa Core One/+',
    printerId: 'COREONE',
    minX: -2000,
    maxX: 252000,
    minY: -19000,
    maxY: 221000,
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 40000,
    parkingCoords: {
      x: 242000,
      y: -9000,
    },
    bedShape: mk52BedShape,
    status: 'supported',
  },
  [PrinterKeys.PrusaCoreOneL]: {
    key: PrinterKeys.PrusaCoreOneL,
    name: 'Prusa Core One L',
    printerId: 'COREONEL',
    minX: -2000,
    maxX: 252000,
    minY: -19000,
    maxY: 221000,
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 40000,
    parkingCoords: {
      x: 242000,
      y: -9000,
    },
    status: 'in-progress',
  },
  [PrinterKeys.PrusaXl]: {
    key: PrinterKeys.PrusaXl,
    name: 'Prusa XL',
    printerId: 'COREONE',
    minX: -2000,
    maxX: 252000,
    minY: -19000,
    maxY: 221000,
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 40000,
    parkingCoords: {
      x: 242000,
      y: -9000,
    },
    status: 'in-progress',
  },
  [PrinterKeys.PrusaMk4]: {
    key: PrinterKeys.PrusaMk4,
    name: 'Prusa MK4 / MK4S',
    printerId: 'COREONE',
    minX: -2000,
    maxX: 252000,
    minY: -19000,
    maxY: 221000,
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 40000,
    parkingCoords: {
      x: 242000,
      y: -9000,
    },
    status: 'planned',
  },
};
