import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { WipingSequence, WipingStep } from './model';

type WipingSequenceState = {
  wipingSequence: WipingSequence;
};

export function createWipingSequenceStore() {
  const initialState: WipingSequenceState = {
    wipingSequence: [],
  };

  const [state, set] = createStore<WipingSequenceState>(initialState);

  const actions = {
    addWipingStep(wipingStep: WipingStep) {
      set(
        'wipingSequence',
        produce((wipingSequence) => {
          wipingSequence.push(wipingStep);
        }),
      );
    },

    setWipingSequence(wipingSequence: WipingSequence) {
      set('wipingSequence', wipingSequence);
    },

    removeLastPoint() {
      set('wipingSequence', (wipingSequence) => {
        return wipingSequence.slice(0, wipingSequence.length - 1);
      });
    },

    clear() {
      set('wipingSequence', []);
    },
  };

  const derived = {
    isComplete: createMemo(() => state.wipingSequence.filter(({ type }) => type === 'point').length >= 2),
  };

  return { state, actions, derived } as const;
}
