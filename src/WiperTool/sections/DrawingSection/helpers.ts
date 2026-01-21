import { createMemo } from 'solid-js';
import type { Point } from '@/WiperTool/lib/geometry';
import { CartesianRect } from '@/WiperTool/lib/rect';
import { usePads, usePrinters } from '@/WiperTool/providers/AppModelProvider';

export function useDrawingPadRect() {
  const { selectedPrinter } = usePrinters();
  const { calibratedPadRect, selectedPad } = usePads();

  return createMemo(() => {
    const padRect = calibratedPadRect();
    if (!padRect) {
      return new CartesianRect(-selectedPad().width, -selectedPad().height, selectedPad().width, selectedPad().height);
    }

    const printer = selectedPrinter();
    const maxPadding = 10000;
    const topPadding = Math.min(printer.bounds.top - padRect.top, maxPadding);
    const bottomPadding = Math.min(padRect.bottom - printer.bounds.bottom, maxPadding);
    const leftPadding = Math.min(padRect.left - printer.bounds.left, maxPadding);
    const rightPadding = Math.min(printer.bounds.right - padRect.right, maxPadding);

    return new CartesianRect(
      -padRect.width - leftPadding,
      -padRect.height - bottomPadding,
      padRect.width + leftPadding + rightPadding,
      padRect.height + topPadding + bottomPadding,
    );
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
  const drawingPadRect = useDrawingPadRect();
  const { calibratedPadRect, selectedPadTopRight } = usePads();

  const drawingPadBoundsWarning = createMemo<BoundsWarning>(() => {
    const rect = drawingPadRect();
    const padRect = calibratedPadRect();
    if (!rect || !padRect) {
      return { kind: 'none' };
    }

    const padTopRight = selectedPadTopRight();
    const drawingRectAbs = new CartesianRect(rect.x + padTopRight.x, rect.y + padTopRight.y, rect.width, rect.height);

    if (!drawingRectAbs.intersects(padRect)) {
      return { kind: 'full' };
    }

    if (padRect.top > drawingRectAbs.top) {
      return { kind: 'partial', side: 'top' };
    }
    if (padRect.bottom < drawingRectAbs.bottom) {
      return { kind: 'partial', side: 'bottom' };
    }
    if (padRect.left < drawingRectAbs.left) {
      return { kind: 'partial', side: 'left' };
    }
    if (padRect.right > drawingRectAbs.right) {
      return { kind: 'partial', side: 'right' };
    }

    return { kind: 'none' };
  });

  return { drawingPadBoundsWarning };
}
