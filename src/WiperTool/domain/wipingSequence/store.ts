import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { WipingSequence, WipingStep } from './model';

type WipingSequenceState = {
  revision: number;
  wipingSequence: WipingSequence;
};

export function createWipingSequenceStore() {
  const initialState: WipingSequenceState = {
    revision: 0,
    wipingSequence: [],
  };

  const [state, set] = createStore<WipingSequenceState>(initialState);

  const bumpRevision = () => {
    set('revision', (value) => value + 1);
  };

  const actions = {
    addWipingStep(wipingStep: WipingStep) {
      set(
        'wipingSequence',
        produce((wipingSequence) => {
          wipingSequence.push(wipingStep);
        }),
      );
      bumpRevision();
    },

    setWipingSequence(wipingSequence: WipingSequence) {
      set('wipingSequence', wipingSequence);
      bumpRevision();
    },

    removeLastPoint() {
      set('wipingSequence', (wipingSequence) => {
        return wipingSequence.slice(0, wipingSequence.length - 1);
      });
      bumpRevision();
    },

    clear() {
      set('wipingSequence', []);
      bumpRevision();
    },
  };

  const derived = {
    isComplete: createMemo(() => state.wipingSequence.filter(({ type }) => type === 'point').length >= 2),
  };

  return { state, actions, derived } as const;
}
