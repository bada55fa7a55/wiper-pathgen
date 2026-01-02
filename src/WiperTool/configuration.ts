import bblA1PadSvg from 'WiperTool/assets/bbl-a1-pad.svg';
import type { Point } from 'WiperTool/store';

export type PadProperties = {
  name: string;
  width: number;
  height: number;
  image: string;
  refPointOffsetX: number;
  refPointOffsetY: number;
};

export type PrinterProperties = {
  name: string;
  printerId: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  originalCleaningGCode: string;
  parkingZHeight: number;
  parkingCoords: Point;
};

export const padProperties: Record<string, PadProperties> = {
  'bbl-a1': {
    name: 'Bambu Lab A1 Nozzle Wiper',
    width: 37000,
    height: 8000,
    image: bblA1PadSvg,
    /** Reference point offset from right edge of pad */
    refPointOffsetX: -1675,
    /** Reference point offset from top edge of pad */
    refPointOffsetY: -1675,
  },
};

export const printerProperties: Record<string, PrinterProperties> = {
  'prusa-core-one': {
    name: 'Prusa Core One',
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
  },
  'prusa-xl': {
    name: 'Prusa XL',
    printerId: 'XL',
    minX: -8000,
    maxX: 361000,
    minY: -9000,
    maxY: 461000,
    originalCleaningGCode: 'G29 P9 X{((((first_layer_print_min[0] + first_layer_print_max[0]) / 2) < ((print_bed_min[0] + print_bed_max[0]) / 2)) ? (((first_layer_print_min[1] - 7) < -2) ? 70 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32)) : (((first_layer_print_min[1] - 7) < -2) ? 260 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32)))} Y{(first_layer_print_min[1] - 7)} W{32} H{7}',
    parkingZHeight: 5000,
    // Note: This is not correct. The nozzle parks within one of the heated bed elements
    // depending on the coordinate sandsimensions of the printed part.
    // G1 X{(min(((((first_layer_print_min[0] + first_layer_print_max[0]) / 2) < ((print_bed_min[0] + print_bed_max[0]) / 2)) ? (((first_layer_print_min[1] - 7) < -2) ? 70 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32)) : (((first_layer_print_min[1] - 7) < -2) ? 260 : (min(print_bed_max[0], first_layer_print_min[0] + 32) - 32))), first_layer_print_min[0])) + 32} Y{(min((first_layer_print_min[1] - 7), first_layer_print_min[1]))} Z{5} F{(travel_speed * 60)}
    parkingCoords: {
      x: 352000,
      y: -9000,
    },
  },
};

export const gridStep = 5000;

export const wiperArmV1Link = {
  label: 'Core One Nozzle Wiper Remix V1 and Purge Bin',
  href: 'https://www.printables.com/model/1284704-prusa-core-one-nozzle-wiper-remix-and-purge-bin',
};
export const wiperArmv2Link = {
  label: 'Core One Nozzle Wiper V2 with Purge Bin',
  href: 'https://www.printables.com/model/1499858-core-one-nozzle-wiper-v2-with-purge-bin',
};
