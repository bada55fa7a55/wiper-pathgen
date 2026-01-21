import { createMemo } from 'solid-js';
import type { PrinterProperties } from '@/WiperTool/domain/printers';
import type { Point } from '@/WiperTool/lib/geometry';
import type { CartesianRect } from '@/WiperTool/lib/rect';
import { usePads, usePrinters } from '@/WiperTool/providers/AppModelProvider';

function calculateDrawingPadPaddings(padRect: CartesianRect | null, printer: PrinterProperties) {
  if (!padRect) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  const maxPadding = 10000;
  const top = printer.bounds.top - padRect.top;
  const bottom = padRect.bottom - printer.bounds.bottom;
  const left = padRect.left - printer.bounds.left;
  const right = printer.bounds.right - padRect.right;

  return {
    top: Math.min(top, maxPadding),
    bottom: Math.min(bottom, maxPadding),
    left: Math.min(left, maxPadding),
    right: Math.min(right, maxPadding),
  };
}

export function useDrawingPadPaddings() {
  const { selectedPrinter } = usePrinters();
  const { calibratedPadRect } = usePads();

  return createMemo(() => {
    const padRect = calibratedPadRect();
    const printer = selectedPrinter();

    return calculateDrawingPadPaddings(padRect, printer);
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

    if (isOutOfBounds) {
      return { kind: 'full' };
    }

    if (paddings.top < 0) {
      return { kind: 'partial', side: 'top' };
    }
    if (paddings.bottom < 0) {
      return { kind: 'partial', side: 'bottom' };
    }
    if (paddings.left < 0) {
      return { kind: 'partial', side: 'left' };
    }
    if (paddings.right < 0) {
      return { kind: 'partial', side: 'right' };
    }

    return { kind: 'none' };
  });

  return { drawingPadBoundsWarning };
}
