import type { PadKey, PrinterKey } from 'WiperTool/configuration';
import type { WipingSequence } from 'WiperTool/store';
import { clearModals, setWipingSequence } from 'WiperTool/store';
import { Button } from 'components';
import { createSignal } from 'solid-js';
import { twc } from 'styles';
import { PreviewWipingSequenceCanvas } from './PreviewWipingSequenceCanvas';

const Content = twc(
  'div',
  `
  flex
  gap-4
  
  flex-col
  items-start
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
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
  onCancel: () => void;
  onClose: () => void;
};

export function ImportConfirmationScene(props: Props) {
  let importTimeout: number | undefined;
  const [imported, setImported] = createSignal(false);

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
    setWipingSequence(props.wipingSequence);
    showImported(() => {
      clearModals();
    });
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
          label="Import & close"
          msIcon="check"
          status={imported() ? 'success' : undefined}
          isDisabled={imported()}
          onClick={handleImport}
        />
      </Actions>
    </Content>
  );
}
