import type { Point, WipingStep } from 'WiperTool/store';
import { umToMm } from './conversion';
import { formatDateISO, formatMicronsToMmString } from './formatting';

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

function micronsToPrinter(microns: Point, referencePoint: Point): Point {
  return {
    x: umToMm(referencePoint.x + microns.x),
    y: umToMm(referencePoint.y + microns.y),
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
    `; ${printerOriginalCleaningGcode} ; <- stock nozzle cleaning`,
    `; Start ${printerName} nozzle wiping sequence`,
    `; REF: X${formatMicronsToMmString(padRef.x)} Y${formatMicronsToMmString(padRef.y)} Z${formatMicronsToMmString(padRef.z)}`,
    `; GEN: ${formatDateISO(new Date())}`,
  ];
}

function generateFooterGCodeCommands() {
  return ['; End nozzle wiping sequence'];
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

  const zHeight = umToMm(padTopRight.z - plungeDepth);
  const gCode: string[] = [];

  points.forEach((pt) => {
    const coords = micronsToPrinter(pt, padTopRight);
    gCode.push(`G1 X${formatAxisXY(coords.x)} Y${formatAxisXY(coords.y)} Z${formatAxisZ(zHeight)} F${feedRate}`);
  });

  const zLiftHeight = umToMm(padTopRight.z - plungeDepth + zLift);
  if (zLiftHeight !== zHeight) {
    gCode.push(`G0 Z${formatAxisZ(zLiftHeight)} F${feedRate}`);
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

  return [
    ...[
      'M17 ; enable steppers',
      // 'M862.1 P0.4 A0 F1 ; nozzle check',
      `M862.3 P "${printerId}" ; printer model check`,
      // 'M862.5 P2 ; g-code level check',
      'M862.6 P"Input shaper" ; FW feature check',
      'G90 ; use absolute coordinates',
      'G28 ; home all without mesh bed level',
      `G0 Z${formatAxisZ(umToMm(printerParkingCoords.z))} F10000 ; parking position z`,
      `G1 X${formatAxisXY(umToMm(printerParkingCoords.x))} Y${formatAxisXY(umToMm(printerParkingCoords.y))} F4800 ; parking position x and y`,
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
    ...[
      `G1 X${formatAxisXY(umToMm(center.x))} Y${formatAxisXY(umToMm(center.y))} Z${formatAxisZ(printerParkingCoords.z)} F4800 ; parking position x and y`,
      'M84 X Y E ; disable motors',
    ],
  ];
}
