import type { PadKey } from 'WiperTool/domain/pads';
import type { PrinterKey } from 'WiperTool/domain/printers';
import { clearShareTokenFromUrl } from 'WiperTool/domain/sharing';
import type { WipingSequence } from 'WiperTool/domain/wipingSequence';
import { actionWipingSequenceImportedEvent, track } from 'WiperTool/lib/analytics';
import { useSteps, useTracking, useWipingSequence } from 'WiperTool/providers/AppModelProvider';
import { StepKeys } from 'WiperTool/ui/steps';
import { Button, WarningMessage } from 'components';
import { createSignal } from 'solid-js';
import { twc } from 'styles';
import { PreviewWipingSequenceCanvas } from './PreviewWipingSequenceCanvas';
import { useScrollToStep } from './useScrollToStep';

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
  gap-2
  w-full
  `,
);

const PreviewDescription = twc(
  'p',
  `
  text-sm
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
  'p',
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
  const wipingSequence = useWipingSequence();
  const { steps } = useSteps();
  const tracking = useTracking();

  const { scrollToStep } = useScrollToStep();

  let importTimeout: number | undefined;
  const [imported, setImported] = createSignal(false);

  const scrollToNextStep = () => {
    const targetStep = steps()[StepKeys.Calibration].isComplete ? StepKeys.Drawing : StepKeys.Calibration;
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
    track(actionWipingSequenceImportedEvent(props.source));

    if (props.source === 'token') {
      clearShareTokenFromUrl();
    }
    wipingSequence.actions.setWipingSequence(props.wipingSequence);
    tracking.actions.setLastWipingSequenceWrite({ type: 'import', source: props.source });
    showImported(() => {
      props.onClose();
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
      <Description>The wiping sequence will be directly applied to the drawing pad once you confirm.</Description>
      <PreviewWrapper>
        <Label>Preview:</Label>
        <PreviewWipingSequenceCanvas
          printerKey={props.printerKey}
          padKey={props.padKey}
          wipingSequence={props.wipingSequence}
        />
        <PreviewDescription>Here's a preview of the wiping sequence that you are about to import.</PreviewDescription>
      </PreviewWrapper>
      {!steps()[StepKeys.Calibration].isComplete && (
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
