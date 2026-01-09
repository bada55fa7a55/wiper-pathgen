import { drawingPathClearedEvent, drawingPathUndoEvent, track } from 'WiperTool/lib/analytics';
import { isCalibrated, isSettingsComplete, setWipingSequence, wipingSequence } from 'WiperTool/store';
import { Button } from 'components';
import { createMemo } from 'solid-js';
import { twc } from 'styles/helpers';

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
  const isDisabled = createMemo(() => !isCalibrated() || !isSettingsComplete() || wipingSequence().length === 0);

  const handleClearClick = () => {
    setWipingSequence([]);
    track(drawingPathClearedEvent());
  };

  const handleUndoClick = () => {
    setWipingSequence((previousSequence) => previousSequence.slice(0, -1));
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
