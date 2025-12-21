import { drawingPresetAppliedEvent, track } from 'WiperTool/lib/analytics';
import { isCalibrated, isSettingsComplete, pad, setPoints } from 'WiperTool/store';
import { Button } from 'components';
import { createMemo } from 'solid-js';
import { twc } from 'styles/helpers';
import { isPadCutOff } from './helpers';
import type { PresetType } from './presets';
import { generatePresetPoints, presetDefinitions } from './presets';

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

  const handlePresetClick = (type: PresetType) => {
    setPoints(generatePresetPoints(type, pad()));
    track(drawingPresetAppliedEvent(type));
  };

  return (
    <Container>
      <div class={isDisabled() ? 'text-shark-300' : undefined}>Presets:</div>
      {presetDefinitions.map((preset) => (
        <Button
          layout="secondary"
          type="button"
          disabled={isDisabled()}
          title={isPadCutOff() ? 'Only available when full pad is reachable by the nozzle' : undefined}
          onClick={() => handlePresetClick(preset.id)}
        >
          {preset.label}
        </Button>
      ))}
    </Container>
  );
}
