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
  gap-3
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
        isDisabled={isDisabled()}
        onClick={handleClearClick}
      />
      <Button
        renderAs="button"
        layout="secondary"
        type="button"
        label="undo"
        isDisabled={isDisabled()}
        onClick={handleUndoClick}
      />
    </Container>
  );
}
