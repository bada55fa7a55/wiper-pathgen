import { createMemo, createSignal } from 'solid-js';

export const ModalKey = {
  Share: 'share',
  ShareLink: 'share-link',
} as const;

export type ModalKey = (typeof ModalKey)[keyof typeof ModalKey];

const [modalStack, setModalStack] = createSignal<ModalKey[]>([]);

const activeModal = createMemo<ModalKey | null>(() => {
  const stack = modalStack();
  return stack.length > 0 ? stack[stack.length - 1] : null;
});

export function isModalOpen(modal: ModalKey) {
  return activeModal() === modal;
}

export function openSubModal(modal: ModalKey) {
  setModalStack((stack) => (stack[stack.length - 1] === modal ? stack : [...stack, modal]));
}

export function openModal(modal: ModalKey) {
  setModalStack([modal]);
}

export function closeModal() {
  setModalStack((stack) => (stack.length === 0 ? stack : stack.slice(0, stack.length - 1)));
}

export function clearModals() {
  setModalStack([]);
}

export function getModalStack() {
  return modalStack();
}

export function getActiveModal() {
  return activeModal();
}
