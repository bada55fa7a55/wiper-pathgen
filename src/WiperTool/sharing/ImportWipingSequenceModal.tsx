import type { PadKey, PrinterKey } from 'WiperTool/configuration';
import type { WipingSequence } from 'WiperTool/store';
import { clearModals, isModalOpen, ModalKey } from 'WiperTool/store';
import { Button, ErrorMessage, MaterialSymbol, Modal } from 'components';
import { createSignal, Match, Show, Switch } from 'solid-js';
import { useDropZone, useFileDialog } from 'solidjs-use';
import { twc } from 'styles';
import { ImportConfirmationScene } from './ImportConfirmationScene';
import { decodeShareFile } from './sharing';

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

const DropZone = twc(
  'div',
  `
  flex
  justify-center
  items-center
  h-48

  rounded
  rounded-lg
  border
  border-dashed
  border-porange-400

  bg-porange-400/20
  `,
  {
    variants: {
      isDropping: {
        false: null,
        true: `
        bg-porange-400/40
        `,
      },
    },
  },
);

const DropZoneContent = twc(
  'div',
  `
  flex
  flex-col
  justify-center
  items-center
  gap-2
  `,
);

const Description = twc(
  'p',
  `
  text-md
  `,
);

export function ImportWipingSequenceModal() {
  const [dropZoneRef, setDropZoneRef] = createSignal<HTMLDivElement>();
  const [state, setState] = createSignal<ModalState>({ status: 'idle' });
  const { open, onChange } = useFileDialog({ multiple: false, reset: true, accept: 'application/json' });

  const importedState = () => {
    const currentState = state();
    return currentState.status === 'imported' ? currentState : null;
  };

  const failureState = () => {
    const currentState = state();
    return currentState.status === 'failure' ? currentState : null;
  };

  const handleFile = (file: File) => {
    (async () => {
      if (file.type !== 'application/json') {
        setState({ status: 'failure', failure: FailureType.UnsupportedFileType });
        return;
      }

      const { printerKey, padKey, wipingSequence } = await decodeShareFile(file);
      setState({ status: 'imported', printerKey, padKey, wipingSequence });
    })().catch((error) => {
      console.error(error);
      setState({ status: 'failure', failure: FailureType.Decode });
    });
  };

  onChange((files) => {
    if (files && files.length !== 0) {
      handleFile(files[0]);
    }
  });

  const handleDrop = (files: File[] | null) => {
    if (files && files.length !== 0) {
      handleFile(files[0]);
    }
  };

  const handleCancelImport = () => {
    setState({ status: 'idle' });
  };

  const { isOverDropZone } = useDropZone(dropZoneRef, handleDrop);

  const handleCloseModal = () => {
    clearModals();
  };

  const handleOpenFileClick = () => {
    open();
  };

  const handleDismissFailure = () => {
    setState({ status: 'idle' });
  };

  return (
    <Modal
      title="Import Wiping Sequence"
      withFooterContentAboveActions
      isOpen={isModalOpen(ModalKey.ImportWipingSequence)}
      withCloseButton
      onClose={handleCloseModal}
    >
      <Switch>
        <Match when={importedState()}>
          {(currentState) => (
            <ImportConfirmationScene
              source="file"
              printerKey={currentState().printerKey}
              padKey={currentState().padKey}
              wipingSequence={currentState().wipingSequence}
              onCancel={handleCancelImport}
              onClose={handleCloseModal}
            />
          )}
        </Match>
        <Match when={['idle', 'failure'].includes(state().status)}>
          <Content>
            <Description>Import a wiping sequence .json file.</Description>
            <DropZone
              isDropping={isOverDropZone()}
              ref={setDropZoneRef}
            >
              <DropZoneContent>
                {isOverDropZone() && (
                  <MaterialSymbol
                    size={48}
                    symbol="upload_file"
                  />
                )}
                {!isOverDropZone() && (
                  <>
                    <div>
                      <Button
                        renderAs="button"
                        layout="primary"
                        label="Choose file"
                        msIcon="file_open"
                        onClick={handleOpenFileClick}
                      />
                    </div>
                    <div>...or drop a file here</div>
                  </>
                )}
              </DropZoneContent>
            </DropZone>
            <Show when={state().status === 'failure'}>
              <Switch>
                <Match when={failureState()?.failure === FailureType.UnsupportedFileType}>
                  <ErrorMessage
                    title="Unsupported file type."
                    content="Upload a .json file that was generated with this tool."
                    onDismiss={handleDismissFailure}
                  />
                </Match>
                <Match when={failureState()?.failure === FailureType.Decode}>
                  <ErrorMessage
                    title="Failed to decode wiping sequence."
                    content="The file appears to be malformatted or incompatibe. Try a different file."
                    onDismiss={handleDismissFailure}
                  />
                </Match>
              </Switch>
            </Show>
          </Content>
        </Match>
      </Switch>
    </Modal>
  );
}
