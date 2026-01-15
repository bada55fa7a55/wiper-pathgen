import type { PrinterBedShape } from '.';

export const bedShapePath: [number, number][] = [
  [25, 0],
  [37, 0],
  [43, 6],
  [211, 6],
  [217, 0],
  [229, 0],
  [254, 25],
  [254, 246],
  [254, 246],
  [250, 250],
  [209, 250],
  [203, 256],
  [191, 256],
  [185, 250],
  [69, 250],
  [63, 256],
  [51, 256],
  [45, 250],
  [4, 250],
  [0, 246],
  [0, 25],
].map(([x, y]) => [x * 1000, y * 1000]);

type NegativeVolume = PrinterBedShape['negativeVolumes'][number];

const negativeVolumes: NegativeVolume[] = [
  {
    type: 'circle',
    x: 57000,
    y: 246000,
    radius: 2900,
  },
  {
    type: 'circle',
    x: 197000,
    y: 246000,
    radius: 2900,
  },
];

const offsetX = -2000;
const offsetY = -14000;
const offset: [number, number] = [offsetX, offsetY];

export const prusaCoreOneBedShape = {
  path: bedShapePath,
  negativeVolumes,
  offset,
};
