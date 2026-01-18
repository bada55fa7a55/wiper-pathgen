import type { PadProperties } from 'WiperTool/domain/pads';
import type { PresetKey } from 'WiperTool/domain/presets';
import { generatePresetSequence, presetDefinitions } from 'WiperTool/domain/presets';
import { drawingPresetAppliedEvent, track } from 'WiperTool/lib/analytics';
import { usePads, useTracking, useWipingSequence } from 'WiperTool/providers/AppModelProvider';
import { WipingSequencePreviewSvg } from 'WiperTool/sections/DrawingSection/PresetButtons/WipingSequencePreviewSvg';
import { Button, Dropdown } from 'components';
import { createMemo, createSignal } from 'solid-js';
import { twc } from 'styles';

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
  const wipingSequence = useWipingSequence();
  const { selectedPad } = usePads();
  const tracking = useTracking();

  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let triggerRef: HTMLButtonElement | undefined;

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen((previousValue) => !previousValue);
  };

  const handlePresetClick = (presetKey: PresetKey) => {
    wipingSequence.actions.setWipingSequence(generatePresetSequence(presetKey, selectedPad()));
    tracking.actions.setLastWipingSequenceWrite({ type: 'preset', preset: presetKey });
    track(drawingPresetAppliedEvent(presetKey));
    handleCloseDropdown();
  };

  return (
    <DropdownWrapper>
      <Button
        renderAs="button"
        layout={props.layout}
        msIcon={isDropdownOpen() ? 'arrow_drop_up' : 'arrow_drop_down'}
        iconPosition="right"
        label={
          <>
            <span class="hidden sm:inline">All presets</span>
            <span class="sm:hidden">Select preset</span>
          </>
        }
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
              content={
                <PresetButtonContent>
                  <PresetPreview
                    presetKey={preset.key}
                    pad={selectedPad()}
                  />
                  <PresetButtonLabel>{preset.label}</PresetButtonLabel>
                </PresetButtonContent>
              }
              isDisabled={props.isDisabled}
              onClick={() => handlePresetClick(preset.key)}
            />
          ))}
        </Dropdown>
      )}
    </DropdownWrapper>
  );
}
