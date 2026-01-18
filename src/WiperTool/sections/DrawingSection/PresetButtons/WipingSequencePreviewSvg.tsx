import type { WipingSequence } from 'WiperTool/domain/wipingSequence';
import { getWipingStepPoints } from 'WiperTool/domain/wipingSequence';
import { createMemo } from 'solid-js';

type Props = {
  sequence: WipingSequence;
  aspectRatio: number;
  sizeMode?: 'height' | 'width' | 'fill';
  class?: string;
  strokeWidth?: number;
  inset?: number;
};

export function WipingSequencePreviewSvg(props: Props) {
  const points = createMemo(() => getWipingStepPoints(props.sequence));
  const aspect = createMemo(() => Math.max(0.05, props.aspectRatio));
  const inset = createMemo(() => props.inset ?? 8);
  const strokeWidth = createMemo(() => props.strokeWidth ?? 3);
  const sizeMode = createMemo(() => props.sizeMode ?? 'height');

  const viewBox = createMemo(() => {
    const viewHeight = 100;
    const viewWidth = Math.max(10, Math.round(viewHeight * aspect()));
    return { viewWidth, viewHeight };
  });

  const polyline = createMemo(() => {
    const pts = points();
    if (pts.length === 0) {
      return '';
    }
    let minX = pts[0].x;
    let maxX = pts[0].x;
    let minY = pts[0].y;
    let maxY = pts[0].y;
    for (let i = 1; i < pts.length; i += 1) {
      const { x, y } = pts[i];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const padding = inset();
    const drawableWidth = viewBox().viewWidth - padding * 2;
    const drawableHeight = viewBox().viewHeight - padding * 2;

    return pts
      .map((point) => {
        const x = padding + ((point.x - minX) / width) * drawableWidth;
        const y = padding + ((maxY - point.y) / height) * drawableHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  const sizeStyle = createMemo(() => {
    switch (sizeMode()) {
      case 'fill':
        return { width: '100%', height: '100%' };
      case 'width':
        return { width: '100%', height: 'auto', 'aspect-ratio': `${aspect()}` };
      case 'height':
      default:
        return { width: 'auto', height: '100%', 'aspect-ratio': `${aspect()}` };
    }
  });

  return (
    <svg
      viewBox={`0 0 ${viewBox().viewWidth} ${viewBox().viewHeight}`}
      class={props.class}
      style={sizeStyle()}
      aria-hidden="true"
    >
      <polyline
        points={polyline()}
        fill="none"
        stroke="currentColor"
        stroke-width={strokeWidth()}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
