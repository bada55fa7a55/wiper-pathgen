import bblA1PadSvg from 'WiperTool/assets/bbl-a1-pad.svg';
import type { Point } from 'WiperTool/store';

export const PrinterKey = {
  PrusaCoreOne: 'prusa-core-one',
  PrusaCoreOneL: 'prusa-core-onel',
  PrusaXl: 'prusa-xl',
  PrusaMk4: 'prusa-mk4',
} as const;

export type PrinterKey = (typeof PrinterKey)[keyof typeof PrinterKey];

export const PadKey = {
  BambuLabA1: 'bbl-a1',
};

export type PadKey = (typeof PadKey)[keyof typeof PadKey];

export type PadProperties = {
  key: PadKey;
  name: string;
  width: number;
  height: number;
  image: string;
  refPointOffsetX: number;
  refPointOffsetY: number;
};

export type PrinterProperties = {
  key: PrinterKey;
  name: string;
  printerId: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  originalCleaningGCode: string;
  parkingZHeight: number;
  parkingCoords: Point;
  status: 'supported' | 'in-progress' | 'planned';
};

export const padProperties: Record<PadKey, PadProperties> = {
  [PadKey.BambuLabA1]: {
    key: PadKey.BambuLabA1,
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
  [PrinterKey.PrusaCoreOne]: {
    key: PrinterKey.PrusaCoreOne,
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
    status: 'supported',
  },
  [PrinterKey.PrusaCoreOneL]: {
    key: PrinterKey.PrusaCoreOneL,
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
  [PrinterKey.PrusaXl]: {
    key: PrinterKey.PrusaXl,
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
  [PrinterKey.PrusaMk4]: {
    key: PrinterKey.PrusaMk4,
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
