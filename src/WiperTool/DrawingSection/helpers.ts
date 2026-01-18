import type { PadProperties } from 'WiperTool/domain/pads';
import type { PrinterProperties } from 'WiperTool/domain/printers';
import type { Point } from 'WiperTool/lib/geometry';
import { useCalibration, usePads, usePrinters } from 'WiperTool/providers/AppModelProvider';
import { createMemo } from 'solid-js';

type MaybePoint = {
  x: number | undefined;
  y: number | undefined;
};

function calculateDrawingPadPaddings(
  calibration: MaybePoint,
  padTopRight: Point,
  pad: PadProperties,
  printer: PrinterProperties,
) {
  if (calibration.x === undefined || calibration.y === undefined) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  const maxPadding = 10000;
  const top = printer.maxY - padTopRight.y;
  const bottom = padTopRight.y - pad.height - printer.minY;

  const left = padTopRight.x - pad.width - printer.minX;
  const right = printer.maxX - padTopRight.x;

  return {
    top: Math.min(top, maxPadding),
    bottom: Math.min(bottom, maxPadding),
    left: Math.min(left, maxPadding),
    right: Math.min(right, maxPadding),
  };
}

export function useDrawingPadPaddings() {
  const calibration = useCalibration();
  const { selectedPrinter } = usePrinters();
  const { selectedPad, selectedPadTopRight } = usePads();

  return createMemo(() => {
    const x = calibration.x();
    const y = calibration.y();
    const topRight = selectedPadTopRight();
    const pad = selectedPad();
    const printer = selectedPrinter();

    return calculateDrawingPadPaddings({ x, y }, topRight, pad, printer);
  });
}

export function relToAbs(relativePoint: Point, padTopRight: Point): Point {
  return {
    x: padTopRight.x + relativePoint.x,
    y: padTopRight.y + relativePoint.y,
  };
}

export function absToRel(absolutePoint: Point, padTopRight: Point): Point {
  return {
    x: absolutePoint.x - padTopRight.x,
    y: absolutePoint.y - padTopRight.y,
  };
}

export type BoundsWarning =
  | { kind: 'none' }
  | { kind: 'full' }
  | { kind: 'partial'; side: 'top' | 'bottom' | 'left' | 'right' };

export function useDrawingPadBoundsWarning() {
  const drawingPadPaddings = useDrawingPadPaddings();
  const { selectedPad } = usePads();

  const drawingPadBoundsWarning = createMemo<BoundsWarning>(() => {
    const { width: padWidth, height: padHeight } = selectedPad();
    const paddings = drawingPadPaddings();

    const isOutOfBounds =
      paddings.top <= -padHeight ||
      paddings.bottom <= -padHeight ||
      paddings.left <= -padWidth ||
      paddings.right <= -padWidth;

    if (isOutOfBounds) return { kind: 'full' };

    if (paddings.top < 0) return { kind: 'partial', side: 'top' };
    if (paddings.bottom < 0) return { kind: 'partial', side: 'bottom' };
    if (paddings.left < 0) return { kind: 'partial', side: 'left' };
    if (paddings.right < 0) return { kind: 'partial', side: 'right' };

    return { kind: 'none' };
  });

  return { drawingPadBoundsWarning };
}
