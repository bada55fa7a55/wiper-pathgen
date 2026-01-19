import { createEffect } from 'solid-js';
import { twc } from '@/styles/helpers';
import type { Point } from '@/WiperTool/lib/geometry';
import { absToRel } from './helpers';

const scale = 0.025; // pixels per micron (25 px/mm)

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
  padWidth: number;
  padHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  padTopRight: Point;
};

export function SimulationCanvas(props: SimulationCanvasProps) {
  let canvasRef: HTMLCanvasElement | undefined;

  const derived = () => {
    const totalPaddingX = props.paddingLeft + props.paddingRight;
    const totalPaddingY = props.paddingTop + props.paddingBottom;
    const widthPx = (props.padWidth + totalPaddingX) * scale;
    const heightPx = (props.padHeight + totalPaddingY) * scale;
    const padStartXPx = props.paddingLeft * scale;
    const padStartYPx = props.paddingTop * scale;
    const refPixelX = padStartXPx + props.padWidth * scale;
    const refPixelY = padStartYPx;

    return {
      widthPx,
      heightPx,
      refPixelX,
      refPixelY,
    };
  };

  const draw = () => {
    if (!canvasRef) {
      return;
    }
    const ctx = canvasRef.getContext('2d');
    if (!ctx) {
      return;
    }

    const { widthPx, heightPx, refPixelX, refPixelY } = derived();
    const { nozzlePos } = props;
    ctx.clearRect(0, 0, widthPx, heightPx);

    if (!nozzlePos) {
      return;
    }

    const relCoords = absToRel(nozzlePos, props.padTopRight);
    const nozzlePx = {
      x: relCoords.x * scale + refPixelX,
      y: refPixelY - relCoords.y * scale,
    };

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
      width={derived().widthPx}
      height={derived().heightPx}
      style={{
        width: '100%',
        height: 'auto',
      }}
    />
  );
}
