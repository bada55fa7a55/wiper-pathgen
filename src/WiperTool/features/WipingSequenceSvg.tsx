import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { twc } from '@/styles/helpers';
import { gridStep } from '@/WiperTool/configuration';
import type { Point } from '@/WiperTool/lib/geometry';
import { CartesianRect } from '@/WiperTool/lib/rect';
import { usePrinters } from '@/WiperTool/providers/AppModelProvider';

const defaultPadTopRight: Point = { x: 0, y: 0 };

const StyledSvg = twc(
  'svg',
  `
  max-w-full
  h-auto
  `,
);

type Props = {
  padImageSrc?: string | null;
  padWidth: number;
  padHeight: number;
  drawingArea: CartesianRect;
  padTopRight?: Point;
  parkingCoords?: Point;
  printerCenter?: Point;
  points: Point[];
  showTravelLines?: boolean;
  calibrationPoint?: Point;
  showCalibrationPoint?: boolean;
  isInteractive?: boolean;
  onAddPoint?: (point: Point) => void;
  onCursorChange?: (point: Point | null) => void;
};

export function WipingSequenceSvg(props: Props) {
  let svgRef: SVGSVGElement | undefined;
  const [mousePos, setMousePos] = createSignal<Point | null>(null);
  const [svgSize, setSvgSize] = createSignal<{ width: number; height: number } | null>(null);
  const padTopRight = () => props.padTopRight ?? defaultPadTopRight;
  const { selectedPrinter } = usePrinters();

  const derived = createMemo(() => {
    const padTopRightCoords = padTopRight();
    const drawingArea = props.drawingArea;
    const padRect = new CartesianRect(
      padTopRightCoords.x - props.padWidth,
      padTopRightCoords.y - props.padHeight,
      props.padWidth,
      props.padHeight,
    );
    const gridStart: Point = {
      x: Math.ceil(drawingArea.left / gridStep) * gridStep,
      y: Math.ceil(drawingArea.bottom / gridStep) * gridStep,
    };

    return {
      drawingArea,
      padRect,
      gridStart,
    };
  });

  const eventToMicrons = (event: MouseEvent): Point => {
    const target = event.currentTarget as SVGSVGElement;
    const rect = target.getBoundingClientRect();
    const { drawingArea } = derived();
    const x = drawingArea.left + ((event.clientX - rect.left) / rect.width) * drawingArea.width;
    const ySvg = drawingArea.bottom + ((event.clientY - rect.top) / rect.height) * drawingArea.height;
    const y = drawingArea.top + drawingArea.bottom - ySvg;

    return { x, y };
  };

  const handleClick = (event: MouseEvent) => {
    if (props.isInteractive === false) {
      return;
    }
    props.onAddPoint?.(eventToMicrons(event));
  };

  const handleMove = (event: MouseEvent) => {
    if (props.isInteractive === false) {
      return;
    }
    const microns = eventToMicrons(event);
    setMousePos(microns);
    props.onCursorChange?.(microns);
  };

  const handleMouseLeave = () => {
    if (props.isInteractive === false) {
      return;
    }
    setMousePos(null);
    props.onCursorChange?.(null);
  };

  const boundsRect = createMemo(() => {
    return selectedPrinter().bounds.toJSON();
  });

  const gridLines = createMemo(() => {
    const { drawingArea, gridStart } = derived();
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (let i = gridStart.x; i < drawingArea.right; i += gridStep) {
      lines.push({ x1: i, y1: drawingArea.bottom, x2: i, y2: drawingArea.top });
    }
    for (let i = gridStart.x; i > drawingArea.left; i -= gridStep) {
      lines.push({ x1: i, y1: drawingArea.bottom, x2: i, y2: drawingArea.top });
    }
    for (let i = gridStart.y; i < drawingArea.top; i += gridStep) {
      lines.push({ x1: drawingArea.left, y1: i, x2: drawingArea.right, y2: i });
    }
    for (let i = gridStart.y; i > drawingArea.bottom; i -= gridStep) {
      lines.push({ x1: drawingArea.left, y1: i, x2: drawingArea.right, y2: i });
    }

    return lines;
  });

  const padImageRect = createMemo(() => {
    const { padRect } = derived();

    return {
      x: padRect.left,
      y: padRect.bottom,
      width: padRect.width,
      height: padRect.height,
    };
  });

  const wipingSequencePoints = createMemo(() => {
    return props.points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  });

  const cursorSegment = createMemo(() => {
    if (props.isInteractive === false) {
      return null;
    }
    const current = mousePos();
    if (!current || props.points.length === 0) {
      return null;
    }

    const lastPoint = props.points[props.points.length - 1];
    return { x1: lastPoint.x, y1: lastPoint.y, x2: current.x, y2: current.y };
  });

  const parkingLine = createMemo(() => {
    if (!props.showTravelLines || !props.parkingCoords || props.points.length < 1) {
      return null;
    }

    return {
      x1: props.parkingCoords.x,
      y1: props.parkingCoords.y,
      x2: props.points[0].x,
      y2: props.points[0].y,
    };
  });

  const exitLine = createMemo(() => {
    if (!props.showTravelLines || !props.printerCenter || props.points.length < 2) {
      return null;
    }

    const lastPoint = props.points[props.points.length - 1];
    return { x1: lastPoint.x, y1: lastPoint.y, x2: props.printerCenter.x, y2: props.printerCenter.y };
  });

  const calibrationPoint = createMemo(() => {
    if (!props.showCalibrationPoint || !props.calibrationPoint) {
      return null;
    }

    return { cx: props.calibrationPoint.x, cy: props.calibrationPoint.y };
  });

  const pointCircles = createMemo(() => {
    return props.points;
  });

  createEffect(() => {
    if (!svgRef || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateSize = () => {
      const rect = svgRef?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setSvgSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(svgRef);

    return () => observer.disconnect();
  });

  const micronsPerPx = createMemo(() => {
    const size = svgSize();
    if (!size) {
      return null;
    }
    return derived().drawingArea.width / Math.max(1, size.width);
  });

  const strokeWidth = createMemo(() => {
    const size = svgSize();
    if (!size) {
      return 2;
    }

    if (size.width < 400) {
      return 1;
    }
    if (size.width < 480) {
      return 1.5;
    }
    if (size.width < 720) {
      return 2;
    }
    return 2.5;
  });

  const pointRadiusMicrons = createMemo(() => {
    const mpp = micronsPerPx();
    const stroke = strokeWidth();
    return mpp ? 0.75 * mpp * stroke : 0;
  });

  const calibrationRadiusMicrons = createMemo(() => {
    const mpp = micronsPerPx();
    return mpp ? mpp * 10 : 0;
  });

  const flipTransform = createMemo(() => {
    const { drawingArea } = derived();
    return `translate(0 ${drawingArea.top + drawingArea.bottom}) scale(1 -1)`;
  });

  return (
    <StyledSvg
      ref={(el) => {
        svgRef = el;
      }}
      viewBox={`${derived().drawingArea.left} ${derived().drawingArea.bottom} ${derived().drawingArea.width} ${derived().drawingArea.height}`}
      style={{
        width: '100%',
        height: 'auto',
      }}
      onClick={props.isInteractive === false ? undefined : handleClick}
      onMouseMove={props.isInteractive === false ? undefined : handleMove}
      onMouseLeave={props.isInteractive === false ? undefined : handleMouseLeave}
    >
      <g transform={flipTransform()}>
        <Show when={selectedPrinter().bedShape}>
          {(bedShape) => (
            <g transform={`translate(${bedShape().offset[0]}, ${bedShape().offset[1]})`}>
              <path
                class="fill-shark-400/30 stroke-shark-300/30"
                stroke-width={1}
                vector-effect="non-scaling-stroke"
                d={`M ${bedShape()
                  .path.map(([x, y]) => `${x} ${y}`)
                  .join(' L ')}`}
              />
              <For each={bedShape().negativeVolumes}>
                {(negativeVolume) => (
                  <circle
                    cx={negativeVolume.x}
                    cy={negativeVolume.y}
                    r={negativeVolume.radius}
                    class="fill-neutral-800"
                  />
                )}
              </For>
            </g>
          )}
        </Show>
        {props.padImageSrc ? (
          <image
            href={props.padImageSrc}
            x={padImageRect().x}
            y={-(padImageRect().y + padImageRect().height)}
            width={padImageRect().width}
            height={padImageRect().height}
            preserveAspectRatio="none"
            transform="scale(1 -1)"
          />
        ) : null}
        <rect
          class="stroke-orange-400"
          x={boundsRect().x}
          y={boundsRect().y}
          width={boundsRect().width}
          height={boundsRect().height}
          rx="2000"
          fill="none"
          stroke-width={strokeWidth()}
          stroke-dasharray="5, 3"
          vector-effect="non-scaling-stroke"
        />
        <g class="stroke-neutral-600/40">
          {gridLines().map((line) => (
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            />
          ))}
        </g>
        {props.points.length > 0 ? (
          <>
            <polyline
              points={wipingSequencePoints()}
              fill="none"
              stroke-width={strokeWidth()}
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
              class="stroke-porange-500"
            />
            <g class="fill-porange-500">
              {pointCircles().map((point) => (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadiusMicrons()}
                  vector-effect="non-scaling-stroke"
                />
              ))}
            </g>
          </>
        ) : null}
        {parkingLine() ? (
          <line
            x1={parkingLine()!.x1}
            y1={parkingLine()!.y1}
            x2={parkingLine()!.x2}
            y2={parkingLine()!.y2}
            stroke-width={strokeWidth()}
            stroke-dasharray="8 8"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
            class="stroke-sky-400"
          />
        ) : null}
        {exitLine() ? (
          <line
            x1={exitLine()!.x1}
            y1={exitLine()!.y1}
            x2={exitLine()!.x2}
            y2={exitLine()!.y2}
            stroke-width={strokeWidth()}
            stroke-dasharray="6 6"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
            class="stroke-green-400"
          />
        ) : null}
        {cursorSegment() ? (
          <line
            x1={cursorSegment()!.x1}
            y1={cursorSegment()!.y1}
            x2={cursorSegment()!.x2}
            y2={cursorSegment()!.y2}
            stroke-width={strokeWidth()}
            stroke-dasharray="10 10"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
            class="stroke-porange-500/50"
          />
        ) : null}
        {calibrationPoint() ? (
          <circle
            cx={calibrationPoint()!.cx}
            cy={calibrationPoint()!.cy}
            r={calibrationRadiusMicrons()}
            vector-effect="non-scaling-stroke"
            class="fill-red-500"
          />
        ) : null}
      </g>
    </StyledSvg>
  );
}
