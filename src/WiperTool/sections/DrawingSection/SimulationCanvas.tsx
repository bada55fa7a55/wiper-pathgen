import { createEffect, createMemo } from 'solid-js';
import { twc } from '@/styles/helpers';
import { targetCanvasWidth } from '@/WiperTool/configuration';
import { createCartesianMicronCanvasSpace } from '@/WiperTool/lib/cartesianMicronCanvasSpace';
import type { Point } from '@/WiperTool/lib/geometry';
import type { CartesianRect } from '@/WiperTool/lib/rect';

const StyledSimulationCanvas = twc(
  'canvas',
  `
  absolute
  inset-0
  pointer-events-none
  rounded
  `,
);

type SimulationCanvasProps = {
  nozzlePos: Point | null;
  drawingArea: CartesianRect;
};

export function SimulationCanvas(props: SimulationCanvasProps) {
  let canvasRef: HTMLCanvasElement | undefined;

  const derived = createMemo(() => {
    const scale = targetCanvasWidth / props.drawingArea.width;
    return {
      space: createCartesianMicronCanvasSpace(props.drawingArea, scale),
    };
  });

  const draw = () => {
    if (!canvasRef) {
      return;
    }
    const ctx = canvasRef.getContext('2d');
    if (!ctx) {
      return;
    }

    const { space } = derived();
    const { nozzlePos } = props;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, space.canvasWidth, space.canvasHeight);

    if (!nozzlePos) {
      return;
    }

    const nozzlePx = space.micronsToCanvas(nozzlePos);

    const drawNozzle = () => {
      ctx.save();
      // Nozzle tip is origin
      ctx.translate(nozzlePx.x, nozzlePx.y);

      const bodyWidth = 28;
      const bodyHeight = 18;
      const heatbreakHeight = 20;
      const tipHeight = 14;
      const bodyBottomY = -tipHeight;
      const bodyTopY = bodyBottomY - bodyHeight;
      const threadTopY = bodyTopY - heatbreakHeight;

      ctx.fillStyle = 'oklch(76.9% 0.188 70.08)';
      ctx.strokeStyle = 'oklch(92.4% 0.12 95.746)';

      // Nozzle thread
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-10, threadTopY, 20, heatbreakHeight);
      ctx.fill();
      ctx.stroke();
      for (let i = 1; i <= 3; i++) {
        const y = threadTopY + (i * heatbreakHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(-10, y);
        ctx.lineTo(10, y);
        ctx.stroke();
      }

      // Nozzle body
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-bodyWidth / 2, bodyTopY, bodyWidth, bodyHeight);
      ctx.fill();
      ctx.stroke();

      // Nozzle tip
      const baseWidth = bodyWidth * 0.6;
      ctx.beginPath();
      ctx.moveTo(-baseWidth / 2, bodyBottomY);
      ctx.lineTo(0, 0);
      ctx.lineTo(baseWidth / 2, bodyBottomY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    drawNozzle();
  };

  createEffect(draw);

  return (
    <StyledSimulationCanvas
      ref={(el) => {
        canvasRef = el;
      }}
      width={derived().space.canvasWidth}
      height={derived().space.canvasHeight}
      style={{
        width: '100%',
        height: 'auto',
      }}
    />
  );
}
