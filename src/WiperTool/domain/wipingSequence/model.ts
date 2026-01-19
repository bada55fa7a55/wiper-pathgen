import type { Point } from '@/WiperTool/lib/geometry';

export type WipingStepPoint = Point & {
  type: 'point';
};

export type WipingStepSpeedChange = {
  type: 'speedChange';
  percentage: number;
};

export type WipingStep = WipingStepPoint | WipingStepSpeedChange;
export type WipingSequence = WipingStep[];

export function getWipingStepPoints(sequence: WipingSequence): Point[] {
  return sequence.flatMap((item) => (item.type === 'point' ? [{ x: item.x, y: item.y }] : []));
}

export function makeWipingStepPoint(point: Point): WipingStepPoint {
  return {
    type: 'point',
    x: point.x,
    y: point.y,
  };
}
