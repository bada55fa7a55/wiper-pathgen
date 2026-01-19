import type { PadProperties } from '@/WiperTool/domain/pads';
import type { WipingSequence } from '@/WiperTool/domain/wipingSequence';
import { makeWipingStepPoint } from '@/WiperTool/domain/wipingSequence';
import type { Point } from '@/WiperTool/lib/geometry';

export type PresetKey = 'zigzag' | 'zigzag-bidi' | 'hilbert' | 'spiral' | 'crosshatch' | 'ultimate';

export const presetDefinitions: { key: PresetKey; label: string }[] = [
  { key: 'ultimate', label: 'Ultimate Wipe' },
  { key: 'zigzag-bidi', label: 'Bi-Diagonal ZigZag' },
  { key: 'hilbert', label: 'Stretched Hilbert' },
  { key: 'crosshatch', label: 'Crosshatch' },
  { key: 'spiral', label: 'Spiral' },
];

type PadGeometry = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  marginX: number;
  marginY: number;
  usableWidth: number;
  usableHeight: number;
};

const marginRatio = 0.05;

const getPadGeometry = (pad: PadProperties): PadGeometry => {
  const left = Math.round(pad.width * -1);
  const right = 0;
  const top = 0;
  const bottom = Math.round(pad.height * -1);

  const width = Math.round(pad.width);
  const height = Math.round(pad.height);
  const marginX = width * marginRatio;
  const marginY = height * marginRatio;

  return {
    left,
    right,
    top,
    bottom,
    width,
    height,
    marginX,
    marginY,
    usableWidth: width - marginX * 2,
    usableHeight: height - marginY * 2,
  };
};

const mapNormalizedToPad = (geom: PadGeometry, nx: number, ny: number): Point => ({
  x: Math.round(geom.left + geom.marginX + nx * geom.usableWidth),
  y: Math.round(geom.top - (geom.marginY + ny * geom.usableHeight)),
});

const buildZigZag = (geom: PadGeometry, startBottomFirst = false): Point[] => {
  const pts: Point[] = [];
  for (let x = geom.left + geom.width * 0.05; x <= geom.right - geom.width * 0.05; x += geom.width * 0.1) {
    const firstY = startBottomFirst ? geom.bottom + geom.height * 0.2 : geom.top - geom.height * 0.2;
    const secondY = startBottomFirst ? geom.top - geom.height * 0.2 : geom.bottom + geom.height * 0.2;
    pts.push({ x: Math.round(x), y: Math.round(firstY) });
    pts.push({ x: Math.round(x + geom.width * 0.05), y: Math.round(secondY) });
  }
  return pts;
};

const buildEdgeScrapes = (geom: PadGeometry): Point[] => {
  const insetX = geom.marginX * 0.5;
  const upperY = geom.top - geom.marginY * 0.2;
  const lowerY = geom.bottom + geom.marginY * 0.2;

  return [
    { x: Math.round(geom.left + insetX), y: Math.round(upperY) },
    { x: Math.round(geom.right - insetX), y: Math.round(upperY) },
    { x: Math.round(geom.right - insetX), y: Math.round(lowerY) },
    { x: Math.round(geom.left + insetX), y: Math.round(lowerY) },
  ];
};

const buildCenteredCrosshatch = (geom: PadGeometry, rows: number, cols: number, insetRatio = 0.35): Point[] => {
  const usableX = geom.usableWidth * (1 - insetRatio * 2);
  const usableY = geom.usableHeight * (1 - insetRatio * 2);
  const startX = geom.left + geom.marginX + geom.usableWidth * insetRatio;
  const startY = geom.top - (geom.marginY + geom.usableHeight * insetRatio);

  const mapLocal = (nx: number, ny: number): Point => ({
    x: Math.round(startX + nx * usableX),
    y: Math.round(startY - ny * usableY),
  });

  const pts: Point[] = [];
  for (let i = 0; i < rows; i += 1) {
    const ny = i / (rows - 1);
    const start = mapLocal(0, ny);
    const end = mapLocal(1, ny);
    pts.push(i % 2 === 0 ? start : end, i % 2 === 0 ? end : start);
  }
  for (let i = 0; i < cols; i += 1) {
    const nx = i / (cols - 1);
    const start = mapLocal(nx, 0);
    const end = mapLocal(nx, 1);
    pts.push(i % 2 === 0 ? start : end, i % 2 === 0 ? end : start);
  }
  return pts;
};

const buildHilbertCurve = (geom: PadGeometry, order: number): Point[] => {
  const size = 1 << order;
  const maxIndex = size * size;

  const rot = (n: number, x: number, y: number, rx: number, ry: number) => {
    if (ry === 0) {
      if (rx === 1) {
        x = n - 1 - x;
        y = n - 1 - y;
      }
      const t = x;
      x = y;
      y = t;
    }
    return { x, y };
  };

  const d2xy = (n: number, d: number) => {
    let t = d;
    let x = 0;
    let y = 0;
    for (let s = 1; s < n; s *= 2) {
      const rx = 1 & Math.floor(t / 2);
      const ry = 1 & (t ^ rx);
      const rotated = rot(s, x, y, rx, ry);
      x = rotated.x + s * rx;
      y = rotated.y + s * ry;
      t = Math.floor(t / 4);
    }
    return { x, y };
  };

  const pts: Point[] = [];
  for (let d = 0; d < maxIndex; d += 1) {
    const { x, y } = d2xy(size, d);
    const nx = x / (size - 1);
    const ny = y / (size - 1);
    pts.push(mapNormalizedToPad(geom, nx, ny));
  }
  return pts;
};

const buildRectSpiral = (geom: PadGeometry, loops: number): Point[] => {
  const xMinStart = geom.left + geom.marginX;
  const xMaxStart = geom.right - geom.marginX;
  const yTopStart = geom.top - geom.marginY;
  const yBottomStart = geom.bottom + geom.marginY;
  const stepX = (xMaxStart - xMinStart) / (loops * 2);
  const stepY = (yTopStart - yBottomStart) / (loops * 2);

  const pts: Point[] = [];
  let xMin = xMinStart;
  let xMax = xMaxStart;
  let yTop = yTopStart;
  let yBottom = yBottomStart;

  for (let i = 0; i < loops; i += 1) {
    pts.push(
      { x: Math.round(xMin), y: Math.round(yTop) },
      { x: Math.round(xMax), y: Math.round(yTop) },
      { x: Math.round(xMax), y: Math.round(yBottom) },
      { x: Math.round(xMin), y: Math.round(yBottom) },
    );
    xMin += stepX;
    xMax -= stepX;
    yTop -= stepY;
    yBottom += stepY;
  }
  return pts;
};

const buildCrosshatch = (geom: PadGeometry, rows: number, cols: number): Point[] => {
  const pts: Point[] = [];
  for (let i = 0; i < rows; i += 1) {
    const ny = i / (rows - 1);
    const start = mapNormalizedToPad(geom, 0, ny);
    const end = mapNormalizedToPad(geom, 1, ny);
    if (i % 2 === 0) {
      pts.push(start, end);
    } else {
      pts.push(end, start);
    }
  }

  for (let i = 0; i < cols; i += 1) {
    const nx = i / (cols - 1);
    const start = mapNormalizedToPad(geom, nx, 0);
    const end = mapNormalizedToPad(geom, nx, 1);
    if (i % 2 === 0) {
      pts.push(start, end);
    } else {
      pts.push(end, start);
    }
  }

  return pts;
};

export const generatePresetSequence = (presetKey: PresetKey, pad: PadProperties): WipingSequence => {
  const padGeometry = getPadGeometry(pad);
  const path: Point[] = (() => {
    switch (presetKey) {
      case 'zigzag':
        return buildZigZag(padGeometry);
      case 'zigzag-bidi':
        return [...buildZigZag(padGeometry), ...buildZigZag(padGeometry, true)];
      case 'ultimate': {
        const forward = buildZigZag(padGeometry);
        const reverse = buildZigZag(padGeometry, true);
        const edgeScrapes = buildEdgeScrapes(padGeometry);
        const centerCrosshatch = buildCenteredCrosshatch(padGeometry, 3, 3);
        return [...forward, ...reverse, ...edgeScrapes, ...centerCrosshatch];
      }
      case 'hilbert':
        return buildHilbertCurve(padGeometry, 4);
      case 'spiral':
        return buildRectSpiral(padGeometry, 5);
      case 'crosshatch':
        return buildCrosshatch(padGeometry, 6, 6);
      default:
        return [];
    }
  })();

  return [...path].reverse().map((point) => makeWipingStepPoint(point));
};
