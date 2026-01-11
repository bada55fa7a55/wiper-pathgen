import { WipingSequencePreviewSvg } from 'WiperTool/DrawingSection/PresetButtons/WipingSequencePreviewSvg';
import { drawingPresetAppliedEvent, track } from 'WiperTool/lib/analytics';
import { pad, setWipingSequence } from 'WiperTool/store';
import { Button, Dropdown } from 'components';
import { createMemo, createSignal } from 'solid-js';
import { twc } from 'styles';
import { isPadCutOff } from '../helpers';
import type { PresetType } from './presets';
import { generatePresetSequence, presetDefinitions } from './presets';

const DropdownWrapper = twc(
  'div',
  `
  relative
  
  block
  `,
);

const PresetPreviewFrame = twc(
  'div',
  `
  flex
  items-center
  justify-center
  rounded
  p-0.5
  w-60
  sm:w-48
  `,
);

const PresetButtonContent = twc(
  'div',
  `
  flex
  flex-col
  items-center
  gap-1
  w-full
  `,
);

const PresetButtonLabel = twc(
  'div',
  `
  text-sm
  text-shark-200
  `,
);

const PresetPreview = (props: { type: PresetType }) => {
  const sequence = createMemo(() => generatePresetSequence(props.type, pad()));
  const padAspect = createMemo(() => pad().width / pad().height);

  return (
    <PresetPreviewFrame>
      <WipingSequencePreviewSvg
        sequence={sequence()}
        sizeMode="width"
        aspectRatio={padAspect()}
      />
    </PresetPreviewFrame>
  );
};

type Props = {
  layout: 'secondary' | 'ghost';
  isDisabled?: boolean;
};

export function PresetsDropdownButton(props: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let triggerRef: HTMLButtonElement | undefined;

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen((previousValue) => !previousValue);
  };

  const handlePresetClick = (type: PresetType) => {
    setWipingSequence(generatePresetSequence(type, pad()));
    track(drawingPresetAppliedEvent(type));
    handleCloseDropdown();
  };

  return (
    <DropdownWrapper>
      <Button
        renderAs="button"
        layout={props.layout}
        msIcon={isDropdownOpen() ? 'arrow_drop_up' : 'arrow_drop_down'}
        iconPosition="right"
        label="All presets"
        title="Menu"
        ref={(el) => {
          triggerRef = el;
        }}
        isDisabled={props.isDisabled}
        onClick={handleToggleDropdown}
      />
      {isDropdownOpen() && (
        <Dropdown
          position="right"
          onClose={handleCloseDropdown}
          ignore={[() => triggerRef]}
          anchor={() => triggerRef}
        >
          {presetDefinitions.map((preset) => (
            <Button
              renderAs="button"
              layout="shark"
              type="button"
              title={isPadCutOff() ? 'Only available when full pad is reachable by the nozzle' : undefined}
              content={
                <PresetButtonContent>
                  <PresetPreview type={preset.id} />
                  <PresetButtonLabel>{preset.label}</PresetButtonLabel>
                </PresetButtonContent>
              }
              isDisabled={props.isDisabled}
              onClick={() => handlePresetClick(preset.id)}
            />
          ))}
        </Dropdown>
      )}
    </DropdownWrapper>
  );
}
