import { createEffect, createMemo, createRenderEffect, createSignal } from 'solid-js';
import { isClientRuntime } from '@/lib/runtime';
import { twc } from '@/styles/helpers';
import { gridStep, targetCanvasWidth } from '@/WiperTool/configuration';
import { createCartesianMicronCanvasSpace } from '@/WiperTool/lib/cartesianMicronCanvasSpace';
import type { Point } from '@/WiperTool/lib/geometry';
import { CartesianRect } from '@/WiperTool/lib/rect';

const defaultPadTopRight: Point = { x: 0, y: 0 };

const StyledCanvas = twc(
  'canvas',
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
  onCanvasRef?: (el: HTMLCanvasElement) => void;
};

// Coordinate system:
// - Props and working coordinates are absolute coordinates in microns.
// - Canvas scaling and transform to screen coordinated is handled by canvas space.
export function WipingSequenceCanvas(props: Props) {
  let canvasRef: HTMLCanvasElement | undefined;
  const [mousePos, setMousePos] = createSignal<Point | null>(null);
  const [padImage, setPadImage] = createSignal<HTMLImageElement | null>(null);
  const padTopRight = () => props.padTopRight ?? defaultPadTopRight;

  createEffect(() => {
    if (!isClientRuntime) {
      return;
    }

    const src = props.padImageSrc;
    if (!src) {
      setPadImage(null);
      return;
    }

    let canceled = false;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (!canceled) {
        setPadImage(img);
      }
    };

    return () => {
      canceled = true;
    };
  });

  const derived = createMemo(() => {
    const padTopRightCoords = padTopRight();
    const drawingArea = props.drawingArea;
    const scale = targetCanvasWidth / drawingArea.width;
    const space = createCartesianMicronCanvasSpace(drawingArea, scale);
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
      space,
      padRect,
      gridStart,
    };
  });

  const withMicronsMouseEvent = (handler: (microns: Point, event: MouseEvent) => void) => (event: MouseEvent) => {
    const target = event.currentTarget as HTMLCanvasElement;
    return derived().space.withMicronsMouseEvent(target, handler)(event);
  };

  const canvasToMicrons = (px: number) => {
    return derived().space.canvasToMicrons(px);
  };

  const handleClick = withMicronsMouseEvent((microns) => {
    if (props.isInteractive === false) {
      return;
    }
    props.onAddPoint?.(microns);
  });

  const handleMove = withMicronsMouseEvent((microns) => {
    if (props.isInteractive === false) {
      return;
    }
    setMousePos(microns);
    props.onCursorChange?.(microns);
  });

  const handleMouseLeave = () => {
    if (props.isInteractive === false) {
      return;
    }
    setMousePos(null);
    props.onCursorChange?.(null);
  };

  const draw = (
    mousePosition: Point | null,
    canvasState: ReturnType<typeof derived>,
    padImageElement: HTMLImageElement | null,
    points: Point[],
    parkingCoords: Point | undefined,
    printerCenter: Point | undefined,
    calibrationPoint: Point | undefined,
    showCalibrationPoint: boolean,
    showTravelLines: boolean,
  ) => {
    if (!canvasRef) {
      return;
    }
    const ctx = canvasRef.getContext('2d');
    if (!ctx) {
      return;
    }

    const { space, padRect, gridStart } = canvasState;

    /**
     * Canvas space is flipped to cartesian. Counter-flipping for screen-oriented drawing
     */
    const withScreenCounterFlip = (draw: () => void) => {
      ctx.save();
      ctx.scale(1, -1);
      draw();
      ctx.restore();
    };

    const drawSiliconePad = () => {
      if (padImageElement) {
        withScreenCounterFlip(() => {
          ctx.drawImage(padImageElement, padRect.x, -padRect.y - padRect.height, padRect.width, padRect.height);
        });
      }
    };

    const drawGridLines = () => {
      ctx.strokeStyle = 'rgba(230,231,232,0.3)';
      ctx.lineWidth = canvasToMicrons(1);
      ctx.beginPath();
      for (let i = gridStart.x; i < space.viewBox.right; i += gridStep) {
        ctx.moveTo(i, space.viewBox.bottom);
        ctx.lineTo(i, space.viewBox.top);
      }
      for (let i = gridStart.x; i > space.viewBox.left; i -= gridStep) {
        ctx.moveTo(i, space.viewBox.bottom);
        ctx.lineTo(i, space.viewBox.top);
      }
      for (let i = gridStart.y; i < space.viewBox.top; i += gridStep) {
        ctx.moveTo(space.viewBox.left, i);
        ctx.lineTo(space.viewBox.right, i);
      }
      for (let i = gridStart.y; i > space.viewBox.bottom; i -= gridStep) {
        ctx.moveTo(space.viewBox.left, i);
        ctx.lineTo(space.viewBox.right, i);
      }
      ctx.stroke();
    };

    const drawWipingPath = () => {
      if (points.length > 0) {
        const start = points[0];

        ctx.strokeStyle = '#fd5000';
        ctx.lineWidth = canvasToMicrons(4);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < points.length; i++) {
          const pt = points[i];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fd5000';
        for (const pt of points) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, canvasToMicrons(4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawCalibrationPoint = () => {
      if (!showCalibrationPoint || !calibrationPoint) {
        return;
      }

      ctx.fillStyle = '#ff2222';
      const pt = calibrationPoint;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, canvasToMicrons(10), 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCursorSegment = () => {
      if (props.isInteractive === false) {
        return;
      }

      if (points.length > 0 && mousePosition) {
        const lastPt = points[points.length - 1];

        ctx.beginPath();
        ctx.moveTo(lastPt.x, lastPt.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.strokeStyle = 'rgba(253, 80, 0, 0.5)';
        ctx.setLineDash([canvasToMicrons(10), canvasToMicrons(10)]);
        ctx.lineWidth = canvasToMicrons(3);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const drawDashedLine = (start: Point, end: Point, color: string) => {
      const startPx = start;
      const endPx = end;

      ctx.beginPath();
      ctx.moveTo(startPx.x, startPx.y);
      ctx.lineTo(endPx.x, endPx.y);
      ctx.strokeStyle = color;
      ctx.setLineDash([canvasToMicrons(8), canvasToMicrons(8)]);
      ctx.lineWidth = canvasToMicrons(3);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawParkingToFirstPoint = () => {
      if (!showTravelLines) {
        return;
      }
      if (!parkingCoords) {
        return;
      }
      if (points.length < 1) {
        return;
      }
      drawDashedLine(parkingCoords, points[0], 'oklch(68.5% 0.169 237.323)');
    };

    const drawLastPointToCenter = () => {
      if (!showTravelLines) {
        return;
      }
      if (!printerCenter) {
        return;
      }
      if (points.length < 2) {
        return;
      }
      drawDashedLine(points[points.length - 1], printerCenter, 'oklch(79.2% 0.209 151.711)');
    };

    space.withMicronsContext(ctx, () => {
      drawSiliconePad();
      drawGridLines();
      drawWipingPath();
      drawParkingToFirstPoint();
      drawLastPointToCenter();
      drawCursorSegment();
      drawCalibrationPoint();
    });
  };

  createRenderEffect(() => {
    const currentMousePos = mousePos();
    const canvasState = derived();
    const padImageElement = padImage();
    const points = props.points;
    const parkingCoords = props.parkingCoords;
    const printerCenter = props.printerCenter;
    const calibrationPoint = props.calibrationPoint;
    const showCalibrationPoint = Boolean(props.showCalibrationPoint);
    const showTravelLines = Boolean(props.showTravelLines);

    if (canvasRef) {
      canvasRef.width = Math.max(1, Math.round(canvasState.space.canvasWidth));
      canvasRef.height = Math.max(1, Math.round(canvasState.space.canvasHeight));
    }

    draw(
      currentMousePos,
      canvasState,
      padImageElement,
      points,
      parkingCoords,
      printerCenter,
      calibrationPoint,
      showCalibrationPoint,
      showTravelLines,
    );
  });

  return (
    <StyledCanvas
      ref={(el) => {
        canvasRef = el;
        if (el && props.onCanvasRef) {
          props.onCanvasRef(el);
        }
      }}
      style={{
        width: '100%',
        height: 'auto',
      }}
      onClick={props.isInteractive === false ? undefined : handleClick}
      onMouseMove={props.isInteractive === false ? undefined : handleMove}
      onMouseLeave={props.isInteractive === false ? undefined : handleMouseLeave}
    />
  );
}
