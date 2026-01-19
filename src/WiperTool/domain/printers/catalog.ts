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
    // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/v6.5.1/include/marlin/Configuration_COREONEL.h#L904-L914
    minX: -2000,
    maxX: 302000,
    minY: -8000,
    maxY: 300000,
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 20000,
    parkingCoords: {
      x: 292000,
      y: -5000,
    },
    status: 'supported',
  },
  [PrinterKeys.PrusaXl]: {
    key: PrinterKeys.PrusaXl,
    name: 'Prusa XL',
    printerId: 'XL',
    // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/b91eeda0c16a9931126ea065f2fa2bcc8a983b8d/include/marlin/Configuration_XL.h#L1067-L1085
    minX: -8000,
    maxX: 361000,
    minY: -9000,
    maxY: 461000,
    originalCleaningGCode:
      'G29 P9 X{((((first_layer_print_min[0] + first_layer_print_max[0]) / 2) < ((print_bed_min[0] + print_bed_max[0]) / 2)) ? (((first_layer_print_min[1] - 7) < -2) ? 70 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32)) : (((first_layer_print_min[1] - 7) < -2) ? 260 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32)))} Y{(first_layer_print_min[1] - 7)} W{32} H{7}',
    parkingZHeight: 5000,
    // Note: parking coords are not correct. The nozzle parks within one of the heated bed elements
    // depending on the coordinate sandsimensions of the printed part.
    // G1 X{(min(((((first_layer_print_min[0] + first_layer_print_max[0]) / 2) < ((print_bed_min[0] + print_bed_max[0]) / 2)) ? (((first_layer_print_min[1] - 7) < -2) ? 70 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32)) : (((first_layer_print_min[1] - 7) < -2) ? 260 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32))), first_layer_print_min[0])) + 32} Y{(min((first_layer_print_min[1] - 7), first_layer_print_min[1]))} Z{5} F{(travel_speed * 60)}
    parkingCoords: {
      x: 352000,
      y: -9000,
    },
    status: 'in-progress',
  },
  [PrinterKeys.PrusaMk4]: {
    // Dummy data, not correct
    key: PrinterKeys.PrusaMk4,
    name: 'Prusa MK4 / MK4S',
    printerId: 'MK4',
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
