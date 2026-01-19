import { createSignal, Match, onCleanup, onMount, Switch } from 'solid-js';
import { Button, ErrorMessage, Modal } from '@/components';
import { isAppError } from '@/lib/errors';
import { isClientRuntime } from '@/lib/runtime';
import { twc } from '@/styles';
import type { PadKey } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import { clearShareTokenFromUrl, decodeShareToken, getShareTokenFromUrl } from '@/WiperTool/domain/sharing';
import type { WipingSequence } from '@/WiperTool/domain/wipingSequence';
import { ImportConfirmationScene } from './ImportConfirmationScene';

const FailureType = {
  Decode: 'decode',
  UnsupportedFileType: 'unsupported-file-type',
} as const;

type FailureType = (typeof FailureType)[keyof typeof FailureType];

type ModalState =
  | {
      status: 'idle';
    }
  | {
      status: 'imported';
      wipingSequence: WipingSequence;
      printerKey: PrinterKey;
      padKey: PadKey;
    }
  | {
      status: 'failure';
      failure: FailureType;
    };

const Content = twc(
  'div',
  `
  flex
  gap-4
  
  flex-col
  justify-center
  items-stretch
  `,
);

const Description = twc(
  'p',
  `
  text-md
  `,
);

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportSharedWipingSequenceModal(props: Props) {
  const [state, setState] = createSignal<ModalState>({ status: 'idle' });

  const importedState = () => {
    const currentState = state();
    return currentState.status === 'imported' ? currentState : null;
  };

  const failureState = () => {
    const currentState = state();
    return currentState.status === 'failure' ? currentState : null;
  };

  const handleShareHash = () => {
    const token = getShareTokenFromUrl();
    if (!token) {
      return;
    }

    try {
      const { printerKey, padKey, wipingSequence } = decodeShareToken(token);
      setState({ status: 'imported', printerKey, padKey, wipingSequence });
    } catch (error) {
      if (isAppError(error)) {
        setState({ status: 'failure', failure: FailureType.Decode });
        return;
      }
    }
  };

  onMount(() => {
    handleShareHash();
    window.addEventListener('hashchange', handleShareHash);
  });

  onCleanup(() => {
    if (!isClientRuntime) {
      return;
    }

    window.removeEventListener('hashchange', handleShareHash);
  });

  const handleCloseModal = () => {
    clearShareTokenFromUrl();
    props.onClose();
  };

  return (
    <Modal
      title="Import Shared Wiping Sequence"
      withFooterContentAboveActions
      isOpen={props.isOpen}
      withCloseButton
      actions={
        failureState() ? (
          <Button
            renderAs="button"
            layout="secondary"
            label="Dismiss"
            onClick={handleCloseModal}
          />
        ) : undefined
      }
      onClose={handleCloseModal}
    >
      <Switch>
        <Match when={state().status === 'idle'}>
          <Content>...</Content>
        </Match>
        <Match when={importedState()}>
          {(currentState) => (
            <Content>
              <Description>Someone has shared a nozzle wiping sequence with you. Nice!</Description>
              <ImportConfirmationScene
                source="token"
                printerKey={currentState().printerKey}
                padKey={currentState().padKey}
                wipingSequence={currentState().wipingSequence}
                onCancel={handleCloseModal}
                onClose={handleCloseModal}
              />
            </Content>
          )}
        </Match>
        <Match when={failureState()}>
          {(currentState) => (
            <Content>
              <Switch>
                <Match when={currentState()?.failure === FailureType.Decode}>
                  <ErrorMessage
                    title="Failed to decode wiping sequence."
                    content="The URL appears to be malformatted or incompatibe. Make sure accessed the full link."
                  />
                </Match>
              </Switch>
            </Content>
          )}
        </Match>
      </Switch>
    </Modal>
  );
}
