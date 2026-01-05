import { createSignal } from 'solid-js';

export type Point = {
  x: number;
  y: number;
};

export type WipingStepPoint = Point & {
  type: 'point';
};

export type WipingStepSpeedChange = {
  type: 'speedChange';
  percentage: number;
};

export type WipingStep = WipingStepPoint | WipingStepSpeedChange;

export const isWipingStepPoint = (item: WipingStep): item is WipingStepPoint => item.type === 'point';

export const makeWipingStepPoint = (point: Point): WipingStepPoint => ({
  type: 'point',
  x: point.x,
  y: point.y,
});

export const getWipingStepPoints = (sequence: WipingStep[]): Point[] =>
  sequence.flatMap((item) => (item.type === 'point' ? [{ x: item.x, y: item.y }] : []));

// Wiping sequence items are stored relative to the pad's top-right corner (calibration-derived) in microns.
export const [wipingSequence, setWipingSequence] = createSignal<WipingStep[]>([]);
