import { createEffect, createMemo, createRenderEffect, createSignal } from 'solid-js';
import { isClientRuntime } from '@/lib/runtime';
import { twc } from '@/styles/helpers';
import { gridStep } from '@/WiperTool/configuration';
import type { Point } from '@/WiperTool/lib/geometry';
import { CartesianRect } from '@/WiperTool/lib/rect';
import { relToAbs } from '@/WiperTool/sections/DrawingSection/helpers';

const scale = 0.025; // pixels per micron (25 px/mm)
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
  drawingAreaRect: CartesianRect;
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
// - Props are absolute coordinates (cartesian printer coordinates in microns).
// - Internal coordinate system is cartesian, in pixels relative to the pad's
//   top right corner
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
    const drawingAreaRel = props.drawingAreaRect.clone().shift({
      x: -padTopRightCoords.x,
      y: -padTopRightCoords.y,
    });
    const drawingAreaPx = drawingAreaRel.clone().scale(scale);

    const refPixelX = -drawingAreaPx.left;
    const refPixelY = -drawingAreaPx.bottom;
    const padWidthPx = props.padWidth * scale;
    const padHeightPx = props.padHeight * scale;
    const padRectPx = new CartesianRect(-padWidthPx, -padHeightPx, padWidthPx, padHeightPx);
    const gridStepPx = gridStep * scale;
    const relLeft = drawingAreaRel.left;
    const relBottom = drawingAreaRel.bottom;

    const firstGridRelX = Math.ceil((padTopRightCoords.x + relLeft) / gridStep) * gridStep - padTopRightCoords.x;
    const firstGridRelY = Math.ceil((padTopRightCoords.y + relBottom) / gridStep) * gridStep - padTopRightCoords.y;
    const gridStartPx: Point = {
      x: firstGridRelX * scale,
      y: firstGridRelY * scale,
    };

    return {
      drawingAreaPx,
      padRectPx,
      gridStartPx,
      gridStepPx,
      refPixelX,
      refPixelY,
    };
  });

  const eventToCanvasPx = (e: MouseEvent): Point => {
    const target = e.currentTarget as HTMLCanvasElement;
    const rect = target.getBoundingClientRect();
    const scaleX = target.width / rect.width;
    const scaleY = target.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const canvasPxToRelPx = (canvasPx: Point, canvasState: ReturnType<typeof derived>): Point => {
    const cartY = canvasState.drawingAreaPx.height - canvasPx.y;
    return {
      x: canvasPx.x - canvasState.refPixelX,
      y: cartY - canvasState.refPixelY,
    };
  };

  const relPxToRelMicrons = (relPx: Point): Point => ({
    x: Math.round(relPx.x / scale),
    y: Math.round(relPx.y / scale),
  });

  const relMicronsToRelPx = (rel: Point): Point => ({
    x: rel.x * scale,
    y: rel.y * scale,
  });

  const absMicronsToRelMicrons = (abs: Point): Point => ({
    x: abs.x - padTopRight().x,
    y: abs.y - padTopRight().y,
  });

  const relMicronsToAbsMicrons = (rel: Point): Point => relToAbs(rel, padTopRight());

  const absMicronsToRelPx = (abs: Point): Point => relMicronsToRelPx(absMicronsToRelMicrons(abs));

  const handleClick = (e: MouseEvent) => {
    if (props.isInteractive === false) {
      return;
    }

    const canvasState = derived();
    const canvasPx = eventToCanvasPx(e);
    const relPx = canvasPxToRelPx(canvasPx, canvasState);
    const relMicrons = relPxToRelMicrons(relPx);
    props.onAddPoint?.(relMicronsToAbsMicrons(relMicrons));
  };

  const handleMove = (e: MouseEvent) => {
    if (props.isInteractive === false) {
      return;
    }
    const canvasState = derived();
    const canvasPx = eventToCanvasPx(e);
    const relPx = canvasPxToRelPx(canvasPx, canvasState);
    setMousePos(relPx);
    const relMicrons = relPxToRelMicrons(relPx);
    props.onCursorChange?.(relMicronsToAbsMicrons(relMicrons));
  };

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

    const { drawingAreaPx, padRectPx, gridStartPx, gridStepPx, refPixelX, refPixelY } = canvasState;

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, drawingAreaPx.width, drawingAreaPx.height);
      ctx.setTransform(1, 0, 0, -1, refPixelX, drawingAreaPx.height - refPixelY);
    };

    const drawTransparentBackground = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.beginPath();
      ctx.rect(0, 0, drawingAreaPx.width, drawingAreaPx.height);
      ctx.fill();
      ctx.restore();
    };

    const drawSiliconePad = () => {
      if (padImageElement) {
        ctx.drawImage(padImageElement, padRectPx.x, padRectPx.y, padRectPx.width, padRectPx.height);
      }
    };

    const drawGridLines = () => {
      ctx.strokeStyle = 'rgba(230,231,232,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = gridStartPx.x; i < drawingAreaPx.right; i += gridStepPx) {
        ctx.moveTo(i, drawingAreaPx.bottom);
        ctx.lineTo(i, drawingAreaPx.top);
      }
      for (let i = gridStartPx.x; i > drawingAreaPx.left; i -= gridStepPx) {
        ctx.moveTo(i, drawingAreaPx.bottom);
        ctx.lineTo(i, drawingAreaPx.top);
      }
      for (let i = gridStartPx.y; i < drawingAreaPx.top; i += gridStepPx) {
        ctx.moveTo(drawingAreaPx.left, i);
        ctx.lineTo(drawingAreaPx.right, i);
      }
      for (let i = gridStartPx.y; i > drawingAreaPx.bottom; i -= gridStepPx) {
        ctx.moveTo(drawingAreaPx.left, i);
        ctx.lineTo(drawingAreaPx.right, i);
      }
      ctx.stroke();
    };

    const drawWipingPath = () => {
      if (points.length > 0) {
        const startPx = absMicronsToRelPx(points[0]);

        ctx.strokeStyle = '#fd5000';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(startPx.x, startPx.y);

        for (let i = 1; i < points.length; i++) {
          const ptPx = absMicronsToRelPx(points[i]);
          ctx.lineTo(ptPx.x, ptPx.y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fd5000';
        for (const ptAbs of points) {
          const ptPx = absMicronsToRelPx(ptAbs);
          ctx.beginPath();
          ctx.arc(ptPx.x, ptPx.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawCalibrationPoint = () => {
      if (!showCalibrationPoint || !calibrationPoint) {
        return;
      }

      ctx.fillStyle = '#ff2222';
      const ptPx = absMicronsToRelPx(calibrationPoint);
      ctx.beginPath();
      ctx.arc(ptPx.x, ptPx.y, 10, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCursorSegment = () => {
      if (props.isInteractive === false) {
        return;
      }

      if (points.length > 0 && mousePosition) {
        const lastPtPx = absMicronsToRelPx(points[points.length - 1]);

        ctx.beginPath();
        ctx.moveTo(lastPtPx.x, lastPtPx.y);
        ctx.lineTo(mousePosition.x, mousePosition.y);
        ctx.strokeStyle = 'rgba(253, 80, 0, 0.5)';
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const drawDashedLine = (start: Point, end: Point, color: string) => {
      const startPx = absMicronsToRelPx(start);
      const endPx = absMicronsToRelPx(end);

      ctx.beginPath();
      ctx.moveTo(startPx.x, startPx.y);
      ctx.lineTo(endPx.x, endPx.y);
      ctx.strokeStyle = color;
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 3;
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

    clear();
    drawTransparentBackground();
    drawSiliconePad();
    drawGridLines();
    drawWipingPath();
    drawParkingToFirstPoint();
    drawLastPointToCenter();
    drawCursorSegment();

    drawCalibrationPoint();
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
      canvasRef.width = Math.max(1, Math.round(canvasState.drawingAreaPx.width));
      canvasRef.height = Math.max(1, Math.round(canvasState.drawingAreaPx.height));
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
