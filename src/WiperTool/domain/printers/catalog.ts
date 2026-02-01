import { CartesianRect } from '@/WiperTool/lib/rect';
import type { PrinterProperties } from './model';
import { PrinterKeys } from './model';

export const printerProperties: Record<string, PrinterProperties> = {
  [PrinterKeys.PrusaCoreOne]: {
    key: PrinterKeys.PrusaCoreOne,
    name: 'Prusa CORE One/+',
    printerId: 'COREONE',
    bounds: CartesianRect.fromMinMax(-2000, -19000, 252000, 221000),
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 40000,
    parkingCoords: {
      x: 242000,
      y: -9000,
    },
    buildVolume: {
      x: 250000,
      y: 220000,
      z: 270000,
    },
    status: 'supported',
  },
  [PrinterKeys.PrusaCoreOneL]: {
    key: PrinterKeys.PrusaCoreOneL,
    name: 'Prusa CORE One L',
    printerId: 'COREONEL',
    // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/v6.5.1/include/marlin/Configuration_COREONEL.h#L904-L914
    bounds: CartesianRect.fromMinMax(-2000, -8000, 302000, 300000),
    originalCleaningGCode: 'G29 P9 X208 Y-2.5 W32 H4',
    parkingZHeight: 20000,
    parkingCoords: {
      x: 292000,
      y: -5000,
    },
    buildVolume: {
      x: 300000,
      y: 300000,
      z: 330000,
    },
    status: 'in-progress',
  },
  [PrinterKeys.PrusaXl]: {
    key: PrinterKeys.PrusaXl,
    name: 'Prusa XL',
    printerId: 'XL',
    // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/b91eeda0c16a9931126ea065f2fa2bcc8a983b8d/include/marlin/Configuration_XL.h#L1067-L1085
    bounds: CartesianRect.fromMinMax(-8000, -9000, 361000, 461000),
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
    buildVolume: {
      x: 360000,
      y: 360000,
      z: 360000,
    },
    status: 'in-progress',
  },
  [PrinterKeys.PrusaMk4]: {
    key: PrinterKeys.PrusaMk4,
    name: 'Prusa MK4 / MK4S',
    printerId: 'MK4',
    // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/b91eeda0c16a9931126ea065f2fa2bcc8a983b8d/include/marlin/Configuration_MK4.h#L1064-L1074
    bounds: CartesianRect.fromMinMax(-1000, -4000, 251000, 211000),
    originalCleaningGCode: 'G29 P9 X10 Y-4 W32 H4',
    parkingZHeight: 40000,
    parkingCoords: {
      x: 42000,
      y: -4000,
    },
    buildVolume: {
      x: 250000,
      y: 210000,
      z: 220000,
    },
    status: 'planned',
  },
};
