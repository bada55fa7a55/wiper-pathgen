import { createSignal } from 'solid-js';

export type Point = {
  x: number;
  y: number;
};

// Points are stored relative to the pad's top-right corner (calibration-derived) in microns.
export const [points, setPoints] = createSignal<Point[]>([]);
