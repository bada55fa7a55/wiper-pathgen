import type { WipingSequence } from '@/WiperTool/domain/wipingSequence';
import { formatDateISO, formatMicronsToMmString } from '@/WiperTool/lib/formatting';
import type { Point, Point3D } from '@/WiperTool/lib/geometry';
import type { GCodeProgram } from './commands';
import { gCodeCommands } from './commands';

function relativeToAbsolute(microns: Point, referencePoint: Point): Point {
  return {
    x: referencePoint.x + microns.x,
    y: referencePoint.y + microns.y,
  };
}

type GenerateWipingSequenceGCodeOptions = {
  wipingSequence: WipingSequence;
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

const getPointsFromSequence = (sequence: WipingSequence): Point[] =>
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
  const gCode: GCodeProgram = [];

  points.forEach((pt) => {
    const coords = relativeToAbsolute(pt, padTopRight);
    gCode.push(gCodeCommands.linearMove({ ...coords, z: zHeight }, feedRate));
  });

  const zLiftHeight = padTopRight.z - plungeDepth + zLift;
  if (zLiftHeight !== zHeight) {
    gCode.push(gCodeCommands.linearMove({ z: zLiftHeight }, feedRate, 'z-lift'));
  }

  return gCode;
}

export function generateWipingSequenceGCode({
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

export function generateTestGCode({
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
