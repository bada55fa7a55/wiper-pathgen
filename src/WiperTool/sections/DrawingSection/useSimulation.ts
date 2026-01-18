import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { Point } from '@/WiperTool/lib/geometry';

const distanceBetweenPoints = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

const calculatePathLength = (path: Point[]) => {
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    length += distanceBetweenPoints(path[i - 1], path[i]);
  }
  return length;
};

const isSamePath = (a: Point[] | null, b: Point[]) => {
  if (!a || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].x !== b[i].x || a[i].y !== b[i].y) return false;
  }
  return true;
};

const getPointAtDistance = (path: Point[], distance: number): Point => {
  if (path.length === 0) return { x: 0, y: 0 };
  if (distance <= 0) return path[0];

  let remaining = distance;
  for (let i = 1; i < path.length; i++) {
    const start = path[i - 1];
    const end = path[i];
    const segmentLength = distanceBetweenPoints(start, end);

    if (remaining <= segmentLength || segmentLength === 0) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    remaining -= segmentLength;
  }

  return path[path.length - 1];
};

type CreateSimulationOptions = {
  getPoints: () => Point[];
  getFeedRate: () => number | undefined;
  getParkingCoords: () => Point;
  getBedCenter: () => Point;
};

export function createNozzleSimulation({
  getPoints,
  getFeedRate,
  getParkingCoords,
  getBedCenter,
}: CreateSimulationOptions) {
  const [simulationPoint, setSimulationPoint] = createSignal<Point | null>(null);
  const [isSimulating, setIsSimulating] = createSignal(false);

  let animationFrameId: number | null = null;
  let lastFrameTimestamp: number | null = null;
  let simulatedDistance = 0;
  let totalPathLength = 0;
  let simulatedPath: Point[] = [];
  let lastSimPointsSnapshot: Point[] | null = null;
  let lastSimFeedRate: number | undefined;

  const stopSimulation = (clearPoint = true) => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = null;
    lastFrameTimestamp = null;
    simulatedDistance = 0;
    totalPathLength = 0;
    simulatedPath = [];
    lastSimPointsSnapshot = null;
    setIsSimulating(false);
    if (clearPoint) {
      setSimulationPoint(null);
    }
  };

  const stepSimulation = (timestamp: number) => {
    if (!isSimulating()) return;

    const feedRate = getFeedRate();
    if (!feedRate || totalPathLength === 0 || simulatedPath.length < 2) {
      stopSimulation();
      return;
    }

    if (lastFrameTimestamp === null) {
      lastFrameTimestamp = timestamp;
      animationFrameId = requestAnimationFrame(stepSimulation);
      return;
    }

    const deltaMs = timestamp - lastFrameTimestamp;
    lastFrameTimestamp = timestamp;

    // feedRate is mm/min; dividing by 60 yields mm/s which equals microns/ms
    const micronsPerMs = feedRate / 60;
    simulatedDistance += deltaMs * micronsPerMs;

    if (simulatedDistance >= totalPathLength) {
      setSimulationPoint(simulatedPath[simulatedPath.length - 1]);
      stopSimulation();
      return;
    }

    const nextPoint = getPointAtDistance(simulatedPath, simulatedDistance);
    setSimulationPoint(nextPoint);
    animationFrameId = requestAnimationFrame(stepSimulation);
  };

  const startSimulation = () => {
    const feedRate = getFeedRate();
    const currentPoints = getPoints();
    if (!feedRate || feedRate <= 0) return;
    if (currentPoints.length < 2) return;

    stopSimulation();
    simulatedPath = [getParkingCoords(), ...currentPoints, getBedCenter()];
    totalPathLength = calculatePathLength(simulatedPath);
    if (totalPathLength === 0) return;

    lastSimPointsSnapshot = currentPoints.map((pt) => ({ ...pt }));
    lastSimFeedRate = feedRate;
    setIsSimulating(true);
    setSimulationPoint(simulatedPath[0]);
    simulatedDistance = 0;
    lastFrameTimestamp = null;
    animationFrameId = requestAnimationFrame(stepSimulation);
  };

  createEffect(() => {
    const currentPoints = getPoints();
    const feedRate = getFeedRate();

    if (isSimulating() && (!isSamePath(lastSimPointsSnapshot, currentPoints) || feedRate !== lastSimFeedRate)) {
      stopSimulation();
    }
  });

  onCleanup(() => stopSimulation());

  return {
    simulationPoint,
    isSimulating,
    startSimulation,
    stopSimulation,
  };
}
