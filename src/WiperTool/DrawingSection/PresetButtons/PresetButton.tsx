import { WipingSequencePreviewSvg } from 'WiperTool/DrawingSection/PresetButtons/WipingSequencePreviewSvg';
import { drawingPresetAppliedEvent, track } from 'WiperTool/lib/analytics';
import { pad, setLastWipingSequenceWrite, setWipingSequence } from 'WiperTool/store';
import { Button, Tooltip } from 'components';
import { createMemo } from 'solid-js';
import { twc } from 'styles';
import { isPadCutOff } from '../helpers';
import type { PresetKey } from './presets';
import { generatePresetSequence } from './presets';

const PresetPreviewFrame = twc(
  'div',
  `
  p-1
  h-10
  text-orange-400
  hover:text-porange-600
  `,
);

const PresetPreview = (props: { presetKey: PresetKey }) => {
  const sequence = createMemo(() => generatePresetSequence(props.presetKey, pad()));
  const padAspect = createMemo(() => pad().width / pad().height);

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
  let buttonRef: HTMLButtonElement | undefined;

  const handleButtonClick = () => {
    setWipingSequence(generatePresetSequence(props.presetKey, pad()));
    setLastWipingSequenceWrite({ type: 'preset', preset: props.presetKey });
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
        title={isPadCutOff() ? 'Only available when full pad is reachable by the nozzle' : undefined}
        content={<PresetPreview presetKey={props.presetKey} />}
        isDisabled={props.isDisabled}
        onClick={handleButtonClick}
      />
    </>
  );
}
