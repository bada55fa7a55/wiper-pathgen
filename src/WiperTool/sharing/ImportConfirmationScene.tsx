import type { PadKey, PrinterKey } from 'WiperTool/configuration';
import type { WipingSequence } from 'WiperTool/store';
import { clearModals, StepKey, setWipingSequence, steps } from 'WiperTool/store';
import { Button, WarningMessage } from 'components';
import { createSignal } from 'solid-js';
import { twc } from 'styles';
import { PreviewWipingSequenceCanvas } from './PreviewWipingSequenceCanvas';
import { scrollToStep } from './scrollToStep';
import { clearShareTokenFromUrl } from './sharing';

const Content = twc(
  'div',
  `
  flex
  gap-4
  
  flex-col
  items-stretch
  `,
);

const PreviewWrapper = twc(
  'div',
  `
  flex
  flex-col
  gap-1
  w-full
  `,
);

const Actions = twc(
  'div',
  `
  flex
  justify-end
  items-center
  gap-3
  w-full
  `,
);

const Label = twc(
  'div',
  `
    text-sm
    font-bold
  `,
);

const Description = twc(
  'div',
  `
    text-md
  `,
);

type Props = {
  source: 'file' | 'token';
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
  onCancel: () => void;
  onClose: () => void;
};

export function ImportConfirmationScene(props: Props) {
  let importTimeout: number | undefined;
  const [imported, setImported] = createSignal(false);

  const scrollToNextStep = () => {
    const targetStep = steps()[StepKey.Calibration].isComplete ? StepKey.Drawing : StepKey.Calibration;
    scrollToStep(targetStep);
  };

  const showImported = (callback: () => void) => {
    setImported(true);
    if (importTimeout) {
      window.clearTimeout(importTimeout);
    }
    importTimeout = window.setTimeout(() => {
      callback();
      setImported(false);
    }, 700);
  };

  const handleImport = () => {
    if (props.source === 'token') {
      clearShareTokenFromUrl();
    }
    setWipingSequence(props.wipingSequence);
    showImported(() => {
      clearModals();
      scrollToNextStep();
    });
  };

  const getImportButtonLabel = () => {
    switch (props.source) {
      case 'file':
        return 'Import & close';
      case 'token':
        return 'Apply & close';
      default:
        return unreachable(props.source);
    }
  };

  return (
    <Content>
      <PreviewWrapper>
        <Label>Preview:</Label>
        <PreviewWipingSequenceCanvas
          printerKey={props.printerKey}
          padKey={props.padKey}
          wipingSequence={props.wipingSequence}
        />
      </PreviewWrapper>
      <Description>Here's a preview of the wiping sequence that you are about to import.</Description>
      {!steps()[StepKey.Calibration].isComplete && (
        <WarningMessage
          title="Note:"
          content={
            <>
              Before you can view your imported wiping sequence and export G-code you must calibrate the position of
              your silicone pad in the Calibration section.
              <br />
              Don't worry. The page will guide you step-by-step through the process.
            </>
          }
        />
      )}
      <Actions>
        <Button
          renderAs="button"
          layout="secondary"
          label="Cancel"
          isDisabled={imported()}
          onClick={props.onCancel}
        />
        <Button
          renderAs="button"
          layout="primary"
          label={getImportButtonLabel()}
          msIcon="check"
          status={imported() ? 'success' : undefined}
          isDisabled={imported()}
          onClick={handleImport}
        />
      </Actions>
    </Content>
  );
}
