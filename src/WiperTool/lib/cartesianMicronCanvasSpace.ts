import type { Point } from '@/WiperTool/lib/geometry';
import type { CartesianRect } from '@/WiperTool/lib/rect';

export type CartesianMicronsCanvasSpace = {
  viewBox: CartesianRect;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasToMicronsPoint: (px: Point) => Point;
  canvasToMicrons: (px: number) => number;
  micronsToCanvas: (microns: Point) => Point;
  eventToMicrons: (event: MouseEvent, canvas: HTMLCanvasElement) => Point;
  withMicronsMouseEvent: (
    canvas: HTMLCanvasElement,
    handler: (microns: Point, event: MouseEvent) => void,
  ) => (event: MouseEvent) => void;
  withMicronsContext: (ctx: CanvasRenderingContext2D, draw: () => void) => void;
};

export function createCartesianMicronCanvasSpace(viewBox: CartesianRect, scale: number): CartesianMicronsCanvasSpace {
  const canvasWidth = viewBox.width * scale;
  const canvasHeight = viewBox.height * scale;

  const canvasToMicronsPoint = (px: Point): Point => {
    const cartY = canvasHeight - px.y;
    return {
      x: px.x / scale + viewBox.left,
      y: cartY / scale + viewBox.bottom,
    };
  };

  const canvasToMicrons = (px: number) => px / scale;

  const micronsToCanvas = (microns: Point): Point => ({
    x: (microns.x - viewBox.left) * scale,
    y: canvasHeight - (microns.y - viewBox.bottom) * scale,
  });

  const eventToMicrons = (event: MouseEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    return canvasToMicronsPoint(px);
  };

  const withMicronsMouseEvent =
    (canvas: HTMLCanvasElement, handler: (microns: Point, event: MouseEvent) => void) => (event: MouseEvent) => {
      handler(eventToMicrons(event, canvas), event);
    };

  const withMicronsContext = (ctx: CanvasRenderingContext2D, draw: () => void) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.setTransform(scale, 0, 0, -scale, -viewBox.left * scale, canvasHeight + viewBox.bottom * scale);
    draw();
  };

  return {
    viewBox,
    scale,
    canvasWidth,
    canvasHeight,
    canvasToMicronsPoint,
    canvasToMicrons,
    micronsToCanvas,
    eventToMicrons,
    withMicronsMouseEvent,
    withMicronsContext,
  };
}
