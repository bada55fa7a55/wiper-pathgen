import { gridStep } from 'WiperTool/configuration';
import type { Point } from 'WiperTool/store';
import { calibration } from 'WiperTool/store';
import { createEffect, createSignal } from 'solid-js';
import { twc } from 'styles/helpers';
import { relToAbs } from './helpers';

const scale = 0.025; // pixels per micron (25 px/mm)

const StyledCanvas = twc(
  'canvas',
  `
  max-w-full
  h-auto
  `,
);

type CanvasProps = {
  padImageSrc?: string | null;
  padWidth: number;
  padHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  padTopRight: Point;
  parkingCoords: Point;
  printerCenter: Point;
  points: Point[];
  onAddPoint?: (point: Point) => void;
  onCursorChange?: (point: Point | null) => void;
  onCanvasRef?: (el: HTMLCanvasElement) => void;
};

export function Canvas(props: CanvasProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  const [mousePos, setMousePos] = createSignal<Point | null>(null);
  const [padImage, setPadImage] = createSignal<HTMLImageElement | null>(null);

  createEffect(() => {
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

  const derived = () => {
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

    const firstGridRelX = Math.ceil((props.padTopRight.x + relLeft) / gridStep) * gridStep - props.padTopRight.x;
    const firstGridRelY = Math.ceil((props.padTopRight.y + relBottom) / gridStep) * gridStep - props.padTopRight.y;
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
  };

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
        x: abs.x - props.padTopRight.x,
        y: abs.y - props.padTopRight.y,
      },
      refPixelX,
      refPixelY,
    );

  const handleClick = (e: MouseEvent) => {
    const px = getPosPx(e);
    const relCoords = pxToMicrons(px);
    props.onAddPoint?.(relToAbs(relCoords, props.padTopRight));
  };

  const handleMove = (e: MouseEvent) => {
    const px = getPosPx(e);
    setMousePos(px);
    const relCoords = pxToMicrons(px);
    props.onCursorChange?.(relToAbs(relCoords, props.padTopRight));
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    props.onCursorChange?.(null);
  };

  const draw = (mousePosition: Point | null) => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const padImageElement = padImage();
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
    } = derived();
    const { points } = props;

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
      if (calibration.x === undefined || calibration.y === undefined) {
        return;
      }

      ctx.fillStyle = '#ff2222';
      const ptPx = absToPixels({ x: calibration.x, y: calibration.y }, refPixelX, refPixelY);
      ctx.beginPath();
      ctx.arc(ptPx.x, ptPx.y, 10, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCursorSegment = () => {
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
      if (points.length < 1) {
        return;
      }
      drawDashedLine(props.parkingCoords, points[0], 'oklch(68.5% 0.169 237.323)');
    };

    const drawLastPointToCenter = () => {
      if (points.length < 2) {
        return;
      }
      drawDashedLine(points[points.length - 1], props.printerCenter, 'oklch(79.2% 0.209 151.711)');
    };

    clear();
    drawTransparentBackground();
    drawSiliconePad();
    drawGridLines();
    drawWipingPath();
    drawParkingToFirstPoint();
    drawLastPointToCenter();
    drawCursorSegment();

    if ('debug' in window) {
      drawCalibrationPoint();
    }
  };

  createEffect(() => {
    const currentMousePos = mousePos();
    draw(currentMousePos);
  });

  return (
    <StyledCanvas
      ref={(el) => {
        canvasRef = el;
        if (el && props.onCanvasRef) {
          props.onCanvasRef(el);
        }
      }}
      width={derived().widthPx}
      height={derived().heightPx}
      style={{
        width: '100%',
        height: 'auto',
      }}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
