import { isCalibrated, isSettingsComplete } from 'WiperTool/store';
import { createMemo } from 'solid-js';
import { twc } from 'styles/helpers';
import { isPadCutOff } from '../helpers';
import { PresetButton } from './PresetButton';
import { PresetsDropdownButton } from './PresetsDropdownButton';
import { presetDefinitions } from './presets';

const Container = twc(
  'div',
  `
  flex
  flex-row
  flex-wrap
  justify-end
  items-center
  gap-3
  `,
);

export function PresetButtons() {
  const isDisabled = createMemo(() => !isCalibrated() || !isSettingsComplete() || isPadCutOff());

  return (
    <Container>
      <div class={isDisabled() ? 'text-shark-300' : undefined}>Presets:</div>
      {presetDefinitions.map((preset) => (
        <PresetButton
          presetKey={preset.id}
          label={preset.label}
          isDisabled={isDisabled()}
        />
      ))}
      <PresetsDropdownButton layout="secondary" />
    </Container>
  );
}
