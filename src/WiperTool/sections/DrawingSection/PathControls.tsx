import { createMemo } from 'solid-js';
import { Button } from '@/components';
import { twc } from '@/styles/helpers';
import { drawingPathClearedEvent, drawingPathUndoEvent, track } from '@/WiperTool/lib/analytics';
import { useCalibration, useSettings, useWipingSequence } from '@/WiperTool/providers/AppModelProvider';

const Container = twc(
  'div',
  `
  flex
  flex-row
  items-start
  gap-1.5
  sm:gap-3
  `,
);

export function PathControls() {
  const calibration = useCalibration();
  const settings = useSettings();
  const wipingSequence = useWipingSequence();

  const isDisabled = createMemo(
    () => !calibration.isComplete() || !settings.isComplete() || wipingSequence.wipingSteps().length === 0,
  );

  const handleClearClick = () => {
    wipingSequence.actions.setWipingSequence([]);
    track(drawingPathClearedEvent());
  };

  const handleUndoClick = () => {
    wipingSequence.actions.removeLastPoint();
    track(drawingPathUndoEvent());
  };

  return (
    <Container>
      <Button
        renderAs="button"
        layout="secondary"
        type="button"
        label="Clear"
        title="Clear wiping sequence"
        msIcon="delete"
        isDisabled={isDisabled()}
        withResponsiveLabel
        onClick={handleClearClick}
      />
      <Button
        renderAs="button"
        layout="secondary"
        type="button"
        label="Undo"
        title="Undo last point"
        msIcon="undo"
        isDisabled={isDisabled()}
        withResponsiveLabel
        onClick={handleUndoClick}
      />
    </Container>
  );
}
