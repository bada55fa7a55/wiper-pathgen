import { createEffect, createMemo, createRenderEffect, createSignal } from 'solid-js';
import { isClientRuntime } from '@/lib/runtime';
import { twc } from '@/styles/helpers';
import { gridStep } from '@/WiperTool/configuration';
import type { Point } from '@/WiperTool/lib/geometry';
import { relToAbs } from '../sections/DrawingSection/helpers';

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
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
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
    const totalPaddingX = props.paddingLeft + props.paddingRight;
    const totalPaddingY = props.paddingTop + props.paddingBottom;
    const widthPx = (props.padWidth + totalPaddingX) * scale;
    const heightPx = (props.padHeight + totalPaddingY) * scale;
    const padStartXPx = props.paddingLeft * scale;
    const padStartYPx = props.paddingTop * scale;
    const padWidthPx = props.padWidth * scale;
    const padHeightPx = props.padHeight * scale;
    const gridStepPx = gridStep * scale;
    const refPixelX = padStartXPx + props.padWidth * scale;
    const refPixelY = padStartYPx;

    const relLeft = -refPixelX / scale;
    const relBottom = (refPixelY - heightPx) / scale;

    const padTopRightCoords = padTopRight();
    const firstGridRelX = Math.ceil((padTopRightCoords.x + relLeft) / gridStep) * gridStep - padTopRightCoords.x;
    const firstGridRelY = Math.ceil((padTopRightCoords.y + relBottom) / gridStep) * gridStep - padTopRightCoords.y;
    const gridStartXPx = firstGridRelX * scale + refPixelX;
    const gridStartYPx = refPixelY - firstGridRelY * scale;

    return {
      widthPx,
      heightPx,
      padStartXPx,
      padStartYPx,
      padWidthPx,
      padHeightPx,
      gridStartXPx,
      gridStartYPx,
      gridStepPx,
      refPixelX,
      refPixelY,
    };
  });

  const getPosPx = (e: MouseEvent): Point => {
    const target = e.currentTarget as HTMLCanvasElement;
    const rect = target.getBoundingClientRect();
    const scaleX = target.width / rect.width;
    const scaleY = target.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const pxToMicrons = (px: Point): Point => ({
    x: Math.round((px.x - derived().refPixelX) / scale),
    y: Math.round((derived().refPixelY - px.y) / scale),
  });

  const relToPixels = (rel: Point, refPixelX: number, refPixelY: number): Point => ({
    x: rel.x * scale + refPixelX,
    y: refPixelY - rel.y * scale,
  });

  const absToPixels = (abs: Point, refPixelX: number, refPixelY: number): Point =>
    relToPixels(
      {
        x: abs.x - padTopRight().x,
        y: abs.y - padTopRight().y,
      },
      refPixelX,
      refPixelY,
    );

  const handleClick = (e: MouseEvent) => {
    if (props.isInteractive === false) {
      return;
    }

    const px = getPosPx(e);
    const relCoords = pxToMicrons(px);
    props.onAddPoint?.(relToAbs(relCoords, padTopRight()));
  };

  const handleMove = (e: MouseEvent) => {
    if (props.isInteractive === false) {
      return;
    }
    const px = getPosPx(e);
    setMousePos(px);
    const relCoords = pxToMicrons(px);
    props.onCursorChange?.(relToAbs(relCoords, padTopRight()));
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

    const {
      widthPx,
      heightPx,
      padStartXPx,
      padStartYPx,
      padWidthPx,
      padHeightPx,
      gridStartXPx,
      gridStartYPx,
      gridStepPx,
      refPixelX,
      refPixelY,
    } = canvasState;

    const clear = () => {
      ctx.clearRect(0, 0, widthPx, heightPx);
    };

    const drawTransparentBackground = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.beginPath();
      ctx.rect(0, 0, widthPx, heightPx);
      ctx.fill();
    };

    const drawSiliconePad = () => {
      if (padImageElement) {
        ctx.drawImage(padImageElement, padStartXPx, padStartYPx, padWidthPx, padHeightPx);
      }
    };

    const drawGridLines = () => {
      ctx.strokeStyle = 'rgba(230,231,232,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = gridStartXPx; i < widthPx; i += gridStepPx) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, heightPx);
      }
      for (let i = gridStartXPx; i > 0; i -= gridStepPx) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, heightPx);
      }
      for (let i = gridStartYPx; i < heightPx; i += gridStepPx) {
        ctx.moveTo(0, i);
        ctx.lineTo(widthPx, i);
      }
      for (let i = gridStartYPx; i > 0; i -= gridStepPx) {
        ctx.moveTo(0, i);
        ctx.lineTo(widthPx, i);
      }
      ctx.stroke();
    };

    const drawWipingPath = () => {
      if (points.length > 0) {
        const startPx = absToPixels(points[0], refPixelX, refPixelY);

        ctx.strokeStyle = '#fd5000';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(startPx.x, startPx.y);

        for (let i = 1; i < points.length; i++) {
          const ptPx = absToPixels(points[i], refPixelX, refPixelY);
          ctx.lineTo(ptPx.x, ptPx.y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fd5000';
        for (const ptAbs of points) {
          const ptPx = absToPixels(ptAbs, refPixelX, refPixelY);
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
      const ptPx = absToPixels(calibrationPoint, refPixelX, refPixelY);
      ctx.beginPath();
      ctx.arc(ptPx.x, ptPx.y, 10, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCursorSegment = () => {
      if (props.isInteractive === false) {
        return;
      }

      if (points.length > 0 && mousePosition) {
        const lastPtPx = absToPixels(points[points.length - 1], refPixelX, refPixelY);

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
      const startPx = absToPixels(start, refPixelX, refPixelY);
      const endPx = absToPixels(end, refPixelX, refPixelY);

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
      canvasRef.width = Math.max(1, Math.round(canvasState.widthPx));
      canvasRef.height = Math.max(1, Math.round(canvasState.heightPx));
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
