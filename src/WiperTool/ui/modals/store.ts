import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ModalKey } from './model';

type ModalsState = {
  modalStack: ModalKey[];
};

export function createModalsStore() {
  const initialState: ModalsState = {
    modalStack: [],
  };

  const [state, set] = createStore<ModalsState>(initialState);

  const actions = {
    openModal(modal: ModalKey) {
      set('modalStack', [modal]);
    },

    openSubModal(modal: ModalKey) {
      set('modalStack', (stack) => (stack[stack.length - 1] === modal ? stack : [...stack, modal]));
    },

    closeModal() {
      set('modalStack', (stack) => (stack.length === 0 ? stack : stack.slice(0, stack.length - 1)));
    },

    clearModals() {
      set('modalStack', []);
    },
  };

  const derived = {
    activeModal: createMemo<ModalKey | null>(() => {
      return state.modalStack.length ? state.modalStack[state.modalStack.length - 1] : null;
    }),

    isSubModalActive() {
      return state.modalStack.length > 1;
    },
  };

  const queries = {
    isModalOpen: (modal: ModalKey) => {
      return derived.activeModal() === modal;
    },
  };

  return { state, actions, derived, queries } as const;
}
