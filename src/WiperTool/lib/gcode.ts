import type { Point, WipingStep } from 'WiperTool/store';
import { umToMm } from './conversion';
import { formatDateISO, formatMicronsToMmString } from './formatting';

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

function relativeToAbsolute(microns: Point, referencePoint: Point): Point {
  return {
    x: referencePoint.x + microns.x,
    y: referencePoint.y + microns.y,
  };
}

function formatAxisXY(value: number) {
  const rounded = Math.round(value * 1000) / 1000;
  return rounded.toFixed(3);
}

function formatAxisZ(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toFixed(2);
}

function formatAxisE(value: number) {
  const rounded = Math.round(value * 100000) / 100000;
  return rounded.toFixed(5);
}

function quotedParam(value: string, { leadingSpace = false }: { leadingSpace?: boolean } = {}): string {
  return `${leadingSpace ? ' ' : ''}"${value}"`;
}

type GCodeParamValue = string | number | null | undefined;

function formGCodeCommand(command: string, params: Record<string, GCodeParamValue> | null, comment?: string) {
  const commandParts = [command];

  if (params) {
    for (const [param, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        commandParts.push(param);
      } else {
        commandParts.push(`${param}${value}`);
      }
    }
  }

  if (comment) {
    commandParts.push(`; ${comment}`);
  }

  return commandParts.join(' ');
}

const gCodeCommands = {
  comment(text: string) {
    return `; ${text}`;
  },

  linearMove(coords: Partial<Point3D & { e: number }>, feedRate?: number, comment?: string) {
    const params: Record<string, string> = {
      ...(coords.x !== undefined ? { X: formatAxisXY(umToMm(coords.x)) } : {}),
      ...(coords.y !== undefined ? { Y: formatAxisXY(umToMm(coords.y)) } : {}),
      ...(coords.z !== undefined ? { Z: formatAxisZ(umToMm(coords.z)) } : {}),
      // Note: Extrusion is in millimeter, not microns
      ...(coords.e !== undefined ? { E: formatAxisE(coords.e) } : {}),
      ...(feedRate !== undefined ? { F: String(feedRate) } : {}),
    };

    if (coords.e !== undefined) {
      return formGCodeCommand('G1', params, comment);
    }
    return formGCodeCommand('G0', params, comment);
  },

  enableSteppers() {
    return formGCodeCommand('M17', null, 'enable steppers');
  },

  disableSteppers() {
    return formGCodeCommand('M84', { X: null, Y: null, E: null }, 'disable motors');
  },

  absolutePositioning() {
    return formGCodeCommand('G90', null, 'use absolute positioning');
  },

  autoHome() {
    return formGCodeCommand('G28', null, 'home all without mesh bed level');
  },

  // https://reprap.org/wiki/G-code#M862.3:_Model_name
  // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/v6.4.0/src/marlin_stubs/M862_2_3.cpp
  gCodeCompatibilityCheck(printerId: string) {
    return formGCodeCommand('M862.3', { P: quotedParam(printerId, { leadingSpace: true }) }, 'printer model check');
  },

  // https://reprap.org/wiki/G-code#M862.6:_Firmware_features
  // https://github.com/prusa3d/Prusa-Firmware-Buddy/blob/v6.4.0/src/marlin_stubs/M862_6.cpp
  firmwareFeatureCheck(feature: string) {
    return formGCodeCommand('M862.6', { P: quotedParam(feature) }, 'FW feature check');
  },
} satisfies Record<string, (...args: any[]) => string>;

type GenerateWipingSequenceGCodeOptions = {
  wipingSequence: WipingStep[];
  padTopRight: Point3D;
  feedRate: number;
  plungeDepth: number;
  zLift: number;
};

type GenerateHeaderGCodeOptions = {
  printerName: string;
  printerOriginalCleaningGcode: string;
  padRef: Point3D;
};

function generateHeaderGCodeCommands({
  printerName,
  printerOriginalCleaningGcode,
  padRef,
}: GenerateHeaderGCodeOptions) {
  return [
    gCodeCommands.comment(`${printerOriginalCleaningGcode} ; <- stock nozzle cleaning`),
    gCodeCommands.comment(`Start ${printerName} nozzle wiping sequence`),
    gCodeCommands.comment(
      `REF: X${formatMicronsToMmString(padRef.x)} Y${formatMicronsToMmString(padRef.y)} Z${formatMicronsToMmString(padRef.z)}`,
    ),
    gCodeCommands.comment(`GEN: ${formatDateISO(new Date())}`),
  ];
}

function generateFooterGCodeCommands() {
  return [gCodeCommands.comment('End nozzle wiping sequence')];
}

const getPointsFromSequence = (sequence: WipingStep[]): Point[] =>
  sequence.flatMap((item) => (item.type === 'point' ? [{ x: item.x, y: item.y }] : []));

function generateWipingSequenceGCodeCommands({
  wipingSequence,
  padTopRight,
  feedRate,
  plungeDepth,
  zLift,
}: GenerateWipingSequenceGCodeOptions) {
  const points = getPointsFromSequence(wipingSequence);
  if (points.length < 2) {
    return [];
  }

  const zHeight = padTopRight.z - plungeDepth;
  const gCode: string[] = [];

  points.forEach((pt) => {
    const coords = relativeToAbsolute(pt, padTopRight);
    gCode.push(gCodeCommands.linearMove(coords, feedRate));
  });

  const zLiftHeight = padTopRight.z - plungeDepth + zLift;
  if (zLiftHeight !== zHeight) {
    gCode.push(gCodeCommands.linearMove({ z: zLiftHeight }, feedRate, 'z-lift'));
  }

  return gCode;
}

export function generateGCodeCommands({
  printerName,
  printerOriginalCleaningGcode,
  padRef,
  wipingSequence,
  padTopRight,
  feedRate,
  plungeDepth,
  zLift,
}: GenerateHeaderGCodeOptions & GenerateWipingSequenceGCodeOptions) {
  if (getPointsFromSequence(wipingSequence).length < 2) {
    return null;
  }

  return [
    ...generateHeaderGCodeCommands({
      printerName,
      printerOriginalCleaningGcode,
      padRef,
    }),
    ...generateWipingSequenceGCodeCommands({
      wipingSequence,
      padTopRight,
      feedRate,
      plungeDepth,
      zLift,
    }),
    ...generateFooterGCodeCommands(),
  ];
}

type GenerateTestGCodeOptions = {
  printerId: string;
  printerParkingCoords: Point3D;
  printerMaxCoords: Point;
};

export function generateTestGCodeCommands({
  printerName,
  printerId,
  printerOriginalCleaningGcode,
  printerParkingCoords,
  printerMaxCoords,
  padRef,
  wipingSequence,
  padTopRight,
  feedRate,
  plungeDepth,
  zLift,
}: GenerateHeaderGCodeOptions & GenerateWipingSequenceGCodeOptions & GenerateTestGCodeOptions) {
  if (getPointsFromSequence(wipingSequence).length < 2) {
    return null;
  }

  const center = {
    x: 0.5 * printerMaxCoords.x,
    y: 0.5 * printerMaxCoords.y,
  };

  const { z: parkingZ, ...parkingXY } = printerParkingCoords;

  return [
    ...[
      gCodeCommands.comment('NOZZLE WIPER G-CODE TEST'),
      gCodeCommands.enableSteppers(),
      gCodeCommands.gCodeCompatibilityCheck(printerId),
      gCodeCommands.firmwareFeatureCheck('Input shaper'),
      gCodeCommands.absolutePositioning(),
      gCodeCommands.autoHome(),
      gCodeCommands.linearMove({ z: parkingZ }, 10000, 'parking position z'),
      gCodeCommands.linearMove(parkingXY, 4800, 'parking position x and y'),
    ],
    ...generateHeaderGCodeCommands({
      printerName,
      printerOriginalCleaningGcode,
      padRef,
    }),
    ...generateWipingSequenceGCodeCommands({
      wipingSequence,
      padTopRight,
      feedRate,
      plungeDepth,
      zLift,
    }),
    ...generateFooterGCodeCommands(),
    ...[gCodeCommands.linearMove(center, 4800, 'move to center'), gCodeCommands.disableSteppers()],
  ];
}
