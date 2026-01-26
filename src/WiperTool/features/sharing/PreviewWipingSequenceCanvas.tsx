import { createMemo } from 'solid-js';
import { twc } from '@/styles';
import type { PadKey } from '@/WiperTool/domain/pads';
import { padProperties } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import { printerProperties } from '@/WiperTool/domain/printers';
import type { WipingSequence } from '@/WiperTool/domain/wipingSequence';
import { getWipingStepPoints } from '@/WiperTool/domain/wipingSequence';
import { WipingSequenceCanvas } from '@/WiperTool/features/WipingSequenceCanvas';
import { CartesianRect } from '@/WiperTool/lib/rect';
import { padImages } from '@/WiperTool/ui/pads';

const Frame = twc(
  'div',
  `
  relative
  block
  w-full
  `,
);

const Container = twc(
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
  border
  bg-shark-700/80
  border-zinc-700
  `,
);

type Props = {
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
};

export function PreviewWipingSequenceCanvas(props: Props) {
  const importedPad = createMemo(() => padProperties[props.padKey]);
  const printerCenter = createMemo(() => ({
    x: Math.round(printerProperties[props.printerKey].bounds.right / 2),
    y: Math.round(printerProperties[props.printerKey].bounds.top / 2),
  }));
  const sequencePoints = createMemo(() => getWipingStepPoints(props.wipingSequence));

  const previewPadding = createMemo(() => {
    const extraPadding = 2000;
    const points = sequencePoints();
    const padSize = importedPad();

    if (points.length === 0) {
      return {
        left: extraPadding,
        right: extraPadding,
        top: extraPadding,
        bottom: extraPadding,
      };
    }

    const sequenceRect = CartesianRect.fromPoints(points);

    const left = Math.max(extraPadding, -sequenceRect.left - padSize.width + extraPadding);
    const right = Math.max(extraPadding, sequenceRect.right + extraPadding);
    const bottom = Math.max(extraPadding, -sequenceRect.bottom - padSize.height + extraPadding);
    const top = Math.max(extraPadding, sequenceRect.top + extraPadding);

    return {
      left,
      right,
      top,
      bottom,
    };
  });

  const drawingAreaRect = createMemo(() => {
    const padSize = importedPad();
    const padding = previewPadding();

    return new CartesianRect(
      -padSize.width - padding.left,
      -padSize.height - padding.bottom,
      padSize.width + padding.left + padding.right,
      padSize.height + padding.top + padding.bottom,
    );
  });

  return (
    <Container>
      <Frame>
        <WipingSequenceCanvas
          padImageSrc={padImages[importedPad().key]}
          padWidth={importedPad().width}
          padHeight={importedPad().height}
          drawingArea={drawingAreaRect()}
          padTopRight={{ x: 0, y: 0 }}
          points={sequencePoints()}
          calibrationPoint={printerCenter()}
          isInteractive={false}
          showTravelLines={false}
        />
      </Frame>
    </Container>
  );
}
