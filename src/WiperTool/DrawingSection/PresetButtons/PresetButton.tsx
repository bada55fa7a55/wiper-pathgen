import { WipingSequencePreviewSvg } from 'WiperTool/DrawingSection/PresetButtons/WipingSequencePreviewSvg';
import type { PadProperties } from 'WiperTool/domain/pads';
import type { PresetKey } from 'WiperTool/domain/presets';
import { generatePresetSequence } from 'WiperTool/domain/presets';
import { drawingPresetAppliedEvent, track } from 'WiperTool/lib/analytics';
import { usePads, useTracking, useWipingSequence } from 'WiperTool/providers/AppModelProvider';
import { Button, Tooltip } from 'components';
import { createMemo } from 'solid-js';
import { twc } from 'styles';
import { useDrawingPadBoundsWarning } from '../helpers';

const PresetPreviewFrame = twc(
  'div',
  `
  p-1
  h-10
  text-orange-400
  hover:text-porange-600
  `,
);

type PresetPreviewProps = {
  presetKey: PresetKey;
  pad: PadProperties;
};

const PresetPreview = (props: PresetPreviewProps) => {
  const sequence = createMemo(() => generatePresetSequence(props.presetKey, props.pad));
  const padAspect = createMemo(() => props.pad.width / props.pad.height);

  return (
    <PresetPreviewFrame>
      <WipingSequencePreviewSvg
        sequence={sequence()}
        sizeMode="height"
        aspectRatio={padAspect()}
      />
    </PresetPreviewFrame>
  );
};

type Props = {
  presetKey: PresetKey;
  label: string;
  isDisabled?: boolean;
};

export function PresetButton(props: Props) {
  const wipingSequence = useWipingSequence();
  const { selectedPad } = usePads();
  const tracking = useTracking();

  const { drawingPadBoundsWarning } = useDrawingPadBoundsWarning();

  let buttonRef: HTMLButtonElement | undefined;

  const handleButtonClick = () => {
    wipingSequence.actions.setWipingSequence(generatePresetSequence(props.presetKey, selectedPad()));
    tracking.actions.setLastWipingSequenceWrite({ type: 'preset', preset: props.presetKey });
    track(drawingPresetAppliedEvent(props.presetKey));
  };

  return (
    <>
      <Tooltip
        anchor={() => buttonRef}
        position="bottom"
        class="font-semibold"
      >
        {props.label}
      </Tooltip>
      <Button
        ref={(el) => {
          buttonRef = el;
        }}
        renderAs="button"
        layout="secondary"
        type="button"
        size="lg-p0"
        title={
          drawingPadBoundsWarning().kind !== 'none'
            ? 'Only available when full pad is reachable by the nozzle'
            : undefined
        }
        content={
          <PresetPreview
            presetKey={props.presetKey}
            pad={selectedPad()}
          />
        }
        isDisabled={props.isDisabled}
        onClick={handleButtonClick}
      />
    </>
  );
}
