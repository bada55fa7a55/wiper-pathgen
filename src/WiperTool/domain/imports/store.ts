import { createStore } from 'solid-js/store';
import { decodeShareFile } from '@/WiperTool/domain/sharing';
import type { FailureType, WipingSequenceImport } from './model';
import { FailureTypes } from './model';

type ImportsState = {
  wipingSequence: WipingSequenceImport;
};

export function createImportsStore() {
  const initialState: ImportsState = {
    wipingSequence: {
      status: 'idle',
    },
  };

  const [state, set] = createStore<ImportsState>(initialState);

  const actions = {
    async importWipingSequenceFile(file: File) {
      try {
        const { printerKey, padKey, wipingSequence } = await decodeShareFile(file);
        set('wipingSequence', { status: 'imported', printerKey, padKey, wipingSequence });
      } catch (error: unknown) {
        console.error(error);
        set('wipingSequence', { status: 'failure', failure: FailureTypes.Decode });
      }
    },

    resetWipingSequenceImport() {
      set('wipingSequence', { status: 'idle' });
    },

    setWipingSequenceImportFailure(failure: FailureType) {
      set('wipingSequence', { status: 'failure', failure });
    },
  };

  return { state, actions } as const;
}
