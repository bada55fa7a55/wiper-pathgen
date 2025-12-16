import { isCalibrated, isSettingsComplete, points, setPoints } from 'WiperTool/store';
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
  const isDisabled = createMemo(() => !isCalibrated() || !isSettingsComplete() || points().length === 0);

  const handleClearClick = () => {
    setPoints([]);
  };

  const handleUndoClick = () => {
    setPoints((previousPoints) => previousPoints.slice(0, -1));
  };

  return (
    <Container>
      <Button
        layout="secondary"
        type="button"
        disabled={isDisabled()}
        onClick={handleClearClick}
      >
        Clear
      </Button>
      <Button
        layout="secondary"
        type="button"
        disabled={isDisabled()}
        onClick={handleUndoClick}
      >
        Undo
      </Button>
    </Container>
  );
}
