import { gridStep } from 'WiperTool/configuration';
import { drawingPointAddedEvent, simulationStartedEvent, simulationStoppedEvent, track } from 'WiperTool/lib/analytics';
import { formatMicronsToMmString } from 'WiperTool/lib/formatting';
import type { Point } from 'WiperTool/store';
import {
  getWipingStepPoints,
  makeWipingStepPoint,
  pad,
  padTopRight,
  printer,
  setWipingSequence,
  settings,
  wipingSequence,
} from 'WiperTool/store';
import { paddings } from 'WiperTool/store/paddings';
import { Button } from 'components';
import { createMemo, createSignal, Show } from 'solid-js';
import { twc } from 'styles/helpers';
import { Canvas } from './Canvas';
import { absToRel, relToAbs } from './helpers';
import { PathControls } from './PathControls';
import { SimulationCanvas } from './SimulationCanvas';
import { createNozzleSimulation } from './useSimulation';

const Container = twc(
  'div',
  `
  relative
  flex
  justify-start
  flex-col
  p-4
  gap-3
  lg:h-full
  bg-zinc-800
  backdrop-blur
  border
  border-zinc-700/50
  rounded-xl
  `,
);

const TitleRow = twc(
  'div',
  `
  flex
  flex-row
  justify-between
  w-full
  items-start
  gap-3
  flex-wrap
  `,
);

const CanvasFrame = twc(
  'div',
  `
  relative
  block
  w-full
  `,
);

const CanvasWrapper = twc(
  'div',
  `
  relative
  group
  w-full
  flex
  flex-col
  justify-center
  rounded
  shadow-2xl
  cursor-crosshair
  border
  bg-shark-700/80
  border-zinc-700
  `,
);

const CoordinatesLine = twc(
  'div',
  `
  flex
  justify-center
  w-full
  mt-2
  px-1
  text-sm
  font-mono
  text-orange-400
  `,
);

const Legend = twc(
  'div',
  `
    flex
    flex-col
    items-start
    w-full
    text-xs
    text-shark-300
  `,
);

export function DrawingPad() {
  const [cursorMicrons, setCursorMicrons] = createSignal<Point | null>(null);

  const toAbsolute = (relPoint: Point) => relToAbs(relPoint, padTopRight());
  const toRelative = (absPoint: Point) => absToRel(absPoint, padTopRight());

  const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence()));
  const isSimulationDisabled = createMemo(() => sequencePoints().length < 2 || (settings.feedRate ?? 0) <= 0);
  const lastPoint = createMemo(() => {
    const currentPoints = sequencePoints();
    if (currentPoints.length === 0) return null;
    return currentPoints[currentPoints.length - 1];
  });

  const handleSimulateClick = () => {
    if (simulation.isSimulating()) {
      simulation.stopSimulation();
      track(simulationStoppedEvent());
      return;
    }
    simulation.startSimulation();
    track(simulationStartedEvent());
  };

  const handleAddPoint = (absPoint: Point) => {
    const relPoint = toRelative(absPoint);
    setWipingSequence((sequence) => [...sequence, makeWipingStepPoint(relPoint)]);
    track(drawingPointAddedEvent());
  };

  const handleCursorChange = (absPoint: Point | null) => {
    if (absPoint !== null) {
      setCursorMicrons(absPoint ? toRelative(absPoint) : null);
    }
  };

  const getFormattedCoords = (coords: Point) => {
    return {
      x: `${coords.x > 0 ? '+' : ''}${(coords.x / 1000).toFixed(2)}mm`,
      y: `${coords.y > 0 ? '+' : ''}${(coords.y / 1000).toFixed(2)}mm`,
    };
  };

  const printerCenter = createMemo<Point>(() => ({
    x: printer().maxX / 2,
    y: printer().maxY / 2,
  }));
  const absolutePoints = createMemo(() => sequencePoints().map(toAbsolute));

  const simulation = createNozzleSimulation({
    getPoints: absolutePoints,
    getFeedRate: () => settings.feedRate,
    getParkingCoords: () => printer().parkingCoords,
    getBedCenter: printerCenter,
  });

  return (
    <Container>
      <TitleRow>
        <PathControls />
        <Button
          type="button"
          layout="primary"
          disabled={isSimulationDisabled()}
          onClick={handleSimulateClick}
        >
          {simulation.isSimulating() ? 'Stop simulation' : 'Simulate nozzle path'}
        </Button>
      </TitleRow>
      <CanvasWrapper>
        <CanvasFrame
          style={{
            width: '100%',
          }}
        >
          <Canvas
            padImageSrc={pad().image}
            padWidth={pad().width}
            padHeight={pad().height}
            paddingLeft={paddings().left}
            paddingRight={paddings().right}
            paddingTop={paddings().top}
            paddingBottom={paddings().bottom}
            padTopRight={padTopRight()}
            parkingCoords={printer().parkingCoords}
            printerCenter={printerCenter()}
            points={absolutePoints()}
            onAddPoint={handleAddPoint}
            onCursorChange={handleCursorChange}
          />
          <SimulationCanvas
            nozzlePos={simulation.simulationPoint()}
            padWidth={pad().width}
            padHeight={pad().height}
            paddingLeft={paddings().left}
            paddingRight={paddings().right}
            paddingTop={paddings().top}
            paddingBottom={paddings().bottom}
            padTopRight={padTopRight()}
          />
        </CanvasFrame>
        <Show
          keyed
          when={cursorMicrons()}
          fallback={(() => {
            const point = lastPoint();
            if (!point) {
              return <CoordinatesLine>&nbsp;</CoordinatesLine>;
            }

            const formattedPoint = getFormattedCoords(toAbsolute(point));

            return (
              <CoordinatesLine>
                Last point: X:{formattedPoint.x} Y:{formattedPoint.y}
              </CoordinatesLine>
            );
          })()}
        >
          {(cursor) => {
            const formattedCursor = getFormattedCoords(toAbsolute(cursor));

            return (
              <CoordinatesLine>
                Mouse: X:{formattedCursor.x} Y:{formattedCursor.y}
              </CoordinatesLine>
            );
          }}
        </Show>
      </CanvasWrapper>
      <Legend>
        <div class="text-shark-200">Grid: {formatMicronsToMmString(gridStep)}mm</div>
        <div class="text-sky-400">Blue dashed line: Travel move from the parking position to the wiping start.</div>
        <div class="text-green-400">Green dashed line: Travel move to the probing area after wiping.</div>
      </Legend>
    </Container>
  );
}
