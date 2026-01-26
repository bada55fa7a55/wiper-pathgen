import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { Button } from '@/components';
import { twc } from '@/styles/helpers';
import { gridStep } from '@/WiperTool/configuration';
import { getWipingStepPoints, makeWipingStepPoint } from '@/WiperTool/domain/wipingSequence';
import { WipingSequenceCanvas } from '@/WiperTool/features/WipingSequenceCanvas';
import {
  actionImportModalOpenedEvent,
  actionShareModalOpenedEvent,
  drawingPointAddedEvent,
  simulationStartedEvent,
  simulationStoppedEvent,
  track,
} from '@/WiperTool/lib/analytics';
import { formatMicronsToMmString } from '@/WiperTool/lib/formatting';
import type { Point } from '@/WiperTool/lib/geometry';
import { CartesianRect } from '@/WiperTool/lib/rect';
import {
  useCalibration,
  useModals,
  usePads,
  usePrinters,
  useSettings,
  useSteps,
  useTracking,
  useWipingSequence,
} from '@/WiperTool/providers/AppModelProvider';
import { ModalKeys } from '@/WiperTool/ui/modals';
import { padImages } from '@/WiperTool/ui/pads';
import { StepKeys } from '@/WiperTool/ui/steps';
import { useDrawingPadRect, usePadCoordinateTransform } from './helpers';
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

const LeftActions = twc(
  'div',
  `
  flex
  justify-start
  items-center
  grow
  `,
);

const RightActions = twc(
  'div',
  `
  flex
  justify-end
  items-center
  gap-3
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

const DrawingHint = twc(
  'div',
  `
    absolute
    top-0
    bottom-0
    left-0
    right-0
    
    flex
    justify-center
    items-center

    text-xl
    text-shark-300
    
    pointer-events-none
    text-shadow-lg/30

    hover:hidden
  `,
);

export function DrawingPad() {
  const calibration = useCalibration();
  const settings = useSettings();
  const wipingSequence = useWipingSequence();
  const { selectedPrinter } = usePrinters();
  const { selectedPad, selectedPadTopRight } = usePads();
  const { steps } = useSteps();
  const tracking = useTracking();
  const modals = useModals();

  const drawingPadRect = useDrawingPadRect();
  const drawingPadRectAbs = createMemo(() => {
    const rect = drawingPadRect();
    const padTopRight = selectedPadTopRight();
    const pad = selectedPad();

    if (rect) {
      return new CartesianRect(rect.x + padTopRight.x, rect.y + padTopRight.y, rect.width, rect.height);
    }

    return new CartesianRect(padTopRight.x - pad.width, padTopRight.y - pad.height, pad.width, pad.height);
  });
  const [cursorMicrons, setCursorMicrons] = createSignal<Point | null>(null);

  createEffect(() => {
    const dpr = drawingPadRect();
    console.log(dpr);
  });

  const { relToAbs, absToRel } = usePadCoordinateTransform();

  const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence.wipingSteps()));
  const isSimulationDisabled = createMemo(() => sequencePoints().length < 2 || (settings.feedRate() ?? 0) <= 0);
  const lastPoint = createMemo(() => {
    const currentPoints = sequencePoints();
    if (currentPoints.length === 0) {
      return null;
    }
    return currentPoints[currentPoints.length - 1];
  });

  const handleSimulateClick = () => {
    if (simulation.isSimulating()) {
      simulation.stopSimulation();
      track(simulationStoppedEvent());
      return;
    }
    simulation.startSimulation();
    track(simulationStartedEvent(tracking.lastWipingSequenceWrite()));
  };

  const handleImportClick = () => {
    track(actionImportModalOpenedEvent('drawing'));
    modals.actions.openModal(ModalKeys.ImportWipingSequence);
  };

  const handleShareClick = () => {
    track(actionShareModalOpenedEvent('drawing'));
    modals.actions.openModal(ModalKeys.Share);
  };

  const handleAddPoint = (absPoint: Point) => {
    const relPoint = absToRel(absPoint);
    wipingSequence.actions.addWipingStep(makeWipingStepPoint(relPoint));
    tracking.actions.setLastWipingSequenceWrite({ type: 'point' });
    track(drawingPointAddedEvent());
  };

  const handleCursorChange = (absPoint: Point | null) => {
    setCursorMicrons(absPoint !== null ? absToRel(absPoint) : null);
  };

  const getFormattedCoords = (coords: Point) => {
    return {
      x: `${coords.x > 0 ? '+' : ''}${(coords.x / 1000).toFixed(2)}mm`,
      y: `${coords.y > 0 ? '+' : ''}${(coords.y / 1000).toFixed(2)}mm`,
    };
  };

  const printerCenter = createMemo<Point>(() => ({
    x: selectedPrinter().bounds.right / 2,
    y: selectedPrinter().bounds.top / 2,
  }));
  const absolutePoints = createMemo(() => sequencePoints().map(relToAbs));

  const simulation = createNozzleSimulation({
    getPoints: absolutePoints,
    getFeedRate: () => settings.feedRate(),
    getParkingCoords: () => selectedPrinter().parkingCoords,
    getBedCenter: printerCenter,
  });

  return (
    <Container>
      <TitleRow>
        <LeftActions>
          <PathControls />
        </LeftActions>
        <RightActions>
          <Button
            renderAs="button"
            type="button"
            layout="secondary"
            label="Import"
            title="Import a previously exported wiping sequence"
            msIcon="file_open"
            withResponsiveLabel
            onClick={handleImportClick}
          />
          <Button
            renderAs="button"
            type="button"
            layout="secondary"
            label="Share"
            title="Export or share wiping sequence"
            msIcon="share"
            isDisabled={!steps()[StepKeys.Drawing].isComplete}
            withResponsiveLabel
            onClick={handleShareClick}
          />
          <Button
            renderAs="button"
            type="button"
            layout="primary"
            label={
              simulation.isSimulating() ? (
                <>
                  <span class="hidden xl:inline">Stop simulation</span>
                  <span class="xl:hidden">Stop</span>
                </>
              ) : (
                <>
                  <span class="hidden xl:inline">Simulate nozzle path</span>
                  <span class="xl:hidden">Simulate</span>
                </>
              )
            }
            msIcon="wand_stars"
            isDisabled={isSimulationDisabled()}
            onClick={handleSimulateClick}
          />
        </RightActions>
      </TitleRow>
      <CanvasWrapper>
        <CanvasFrame
          style={{
            width: '100%',
          }}
        >
          <WipingSequenceCanvas
            padImageSrc={padImages[selectedPad().key]}
            padWidth={selectedPad().width}
            padHeight={selectedPad().height}
            drawingArea={drawingPadRectAbs()}
            padTopRight={selectedPadTopRight()}
            parkingCoords={selectedPrinter().parkingCoords}
            printerCenter={printerCenter()}
            points={absolutePoints()}
            calibrationPoint={calibration.calibrationPoint()}
            showTravelLines
            onAddPoint={handleAddPoint}
            onCursorChange={handleCursorChange}
          />
          <SimulationCanvas
            nozzlePos={simulation.simulationPoint()}
            drawingArea={drawingPadRectAbs()}
          />
        </CanvasFrame>
        <Show when={sequencePoints().length === 0}>
          <DrawingHint>Click to draw wiping path</DrawingHint>
        </Show>
        <Show
          keyed
          when={cursorMicrons()}
          fallback={(() => {
            const point = lastPoint();
            if (!point) {
              return <CoordinatesLine>&nbsp;</CoordinatesLine>;
            }

            const formattedPoint = getFormattedCoords(relToAbs(point));

            return (
              <CoordinatesLine>
                Last point: X:{formattedPoint.x} Y:{formattedPoint.y}
              </CoordinatesLine>
            );
          })()}
        >
          {(cursor) => {
            const formattedCursor = getFormattedCoords(relToAbs(cursor));

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
