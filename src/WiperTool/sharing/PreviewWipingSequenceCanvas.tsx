import type { PadKey } from 'WiperTool/domain/pads';
import { padProperties } from 'WiperTool/domain/pads';
import type { PrinterKey } from 'WiperTool/domain/printers';
import { printerProperties } from 'WiperTool/domain/printers';
import type { WipingSequence } from 'WiperTool/domain/wipingSequence';
import { getWipingStepPoints } from 'WiperTool/domain/wipingSequence';
import { WipingSequenceCanvas } from 'WiperTool/WipingSequenceCanvas';
import { createMemo } from 'solid-js';
import { twc } from 'styles';

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
    x: Math.round(printerProperties[props.printerKey].maxX / 2),
    y: Math.round(printerProperties[props.printerKey].maxY / 2),
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

    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i += 1) {
      const { x, y } = points[i];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const left = Math.max(extraPadding, -minX - padSize.width + extraPadding);
    const right = Math.max(extraPadding, maxX + extraPadding);
    const bottom = Math.max(extraPadding, -minY - padSize.height + extraPadding);
    const top = Math.max(extraPadding, maxY + extraPadding);

    return {
      left,
      right,
      top,
      bottom,
    };
  });

  return (
    <Container>
      <Frame>
        <WipingSequenceCanvas
          padImageSrc={importedPad().image}
          padWidth={importedPad().width}
          padHeight={importedPad().height}
          paddingLeft={previewPadding().left}
          paddingRight={previewPadding().right}
          paddingTop={previewPadding().top}
          paddingBottom={previewPadding().bottom}
          points={sequencePoints()}
          calibrationPoint={printerCenter()}
          isInteractive={false}
          showTravelLines={false}
        />
      </Frame>
    </Container>
  );
}
