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
};

export const gridStep = 5000;

export const defaultPrinterKey = 'prusa-core-one';

export const wiperArmV1Link = {
  label: 'Core One Nozzle Wiper Remix V1 and Purge Bin',
  href: 'https://www.printables.com/model/1284704-prusa-core-one-nozzle-wiper-remix-and-purge-bin',
};
export const wiperArmv2Link = {
  label: 'Core One Nozzle Wiper V2 with Purge Bin',
  href: 'https://www.printables.com/model/1499858-core-one-nozzle-wiper-v2-with-purge-bin',
};
