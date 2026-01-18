import { Match, Show, Switch } from 'solid-js';
import { useFileDialog } from 'solidjs-use';
import { Button, ErrorMessage, Modal } from '@/components';
import { twc } from '@/styles';
import { FailureTypes, isImportableWipingSequenceFile } from '@/WiperTool/domain/imports';
import { useImports } from '@/WiperTool/providers/AppModelProvider';
import { ImportConfirmationScene } from './ImportConfirmationScene';
import { isDroppingFile } from './useGlobalFileDrop';

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

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportWipingSequenceModal(props: Props) {
  const imports = useImports();

  const { open: openFileDialog, onChange: onFileDialogChange } = useFileDialog({
    multiple: false,
    reset: true,
    accept: 'application/json',
  });

  const importedState = () => {
    const currentState = imports.wipingSequenceImport();
    return currentState.status === 'imported' ? currentState : null;
  };

  const failureState = () => {
    const currentState = imports.wipingSequenceImport();
    return currentState.status === 'failure' ? currentState : null;
  };

  onFileDialogChange((files) => {
    if (files && files.length !== 0) {
      const file = Array.from(files).find(isImportableWipingSequenceFile);
      if (!file) {
        imports.actions.setWipingSequenceImportFailure(FailureTypes.UnsupportedFileType);
        return;
      }

      imports.actions.importWipingSequenceFile(file);
    }
  });

  const handleCancelImport = () => {
    imports.actions.resetWipingSequenceImport();
  };

  const handleOpenFileClick = () => {
    openFileDialog();
  };

  const handleDismissFailure = () => {
    imports.actions.resetWipingSequenceImport();
  };

  return (
    <Modal
      title="Import Wiping Sequence"
      withFooterContentAboveActions
      isOpen={props.isOpen}
      withCloseButton
      onClose={props.onClose}
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
              onClose={props.onClose}
            />
          )}
        </Match>
        <Match when={['idle', 'failure'].includes(imports.wipingSequenceImport().status)}>
          <Content>
            <Description>
              Import a wiping sequence <code>.json</code> file that you have previously exported or that has been shared
              with you.
              <br />
              You can preview the sequence in the next step.
            </Description>
            <DropZone isDropping={isDroppingFile()}>
              <DropZoneContent>
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
              </DropZoneContent>
            </DropZone>
            <Show when={imports.wipingSequenceImport().status === 'failure'}>
              <Switch>
                <Match when={failureState()?.failure === FailureTypes.UnsupportedFileType}>
                  <ErrorMessage
                    title="Unsupported file type."
                    content="Upload a .json file that was generated with this tool."
                    onDismiss={handleDismissFailure}
                  />
                </Match>
                <Match when={failureState()?.failure === FailureTypes.Decode}>
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
