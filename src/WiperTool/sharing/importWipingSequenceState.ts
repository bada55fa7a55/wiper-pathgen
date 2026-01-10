import type { PadKey, PrinterKey } from 'WiperTool/configuration';
import type { WipingSequence } from 'WiperTool/store';
import { createSignal } from 'solid-js';
import { decodeShareFile } from './sharing';

export const FailureType = {
  Decode: 'decode',
  UnsupportedFileType: 'unsupported-file-type',
} as const;

export type FailureType = (typeof FailureType)[keyof typeof FailureType];

export type ModalState =
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

export const [importState, setImportState] = createSignal<ModalState>({ status: 'idle' });

function isJsonFile(file: File) {
  return file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
}

export function isImportableFile(file: File) {
  return isJsonFile(file);
}

export const handleImportFile = (file: File) => {
  (async () => {
    const { printerKey, padKey, wipingSequence } = await decodeShareFile(file);
    setImportState({ status: 'imported', printerKey, padKey, wipingSequence });
  })().catch((error: unknown) => {
    console.error(error);
    setImportState({ status: 'failure', failure: FailureType.Decode });
  });
};

export const resetImportState = () => {
  setImportState({ status: 'idle' });
};

export const setImportFailure = (failure: FailureType) => {
  setImportState({ status: 'failure', failure });
};
