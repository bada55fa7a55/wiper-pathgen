import type { ModalKey } from 'WiperTool/store';
import {
  clearModals,
  closeModal,
  getActiveModal,
  isModalOpen,
  isSubModal,
  openModal,
  openSubModal,
} from 'WiperTool/store';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { Backdrop } from './Backdrop';
import { useModalHistory } from './useModalHistory';

type ModalApi = {
  isModalOpen: (key: ModalKey) => boolean;
  isSubModal: () => boolean;
  activeModal: () => ModalKey | null;
  openModal: (key: ModalKey) => void;
  openSubModal: (key: ModalKey) => void;
  closeModal: () => void;
  clearModals: () => void;
};

type Props = {
  children: (api: ModalApi) => JSX.Element;
};

export function ManagedModals(props: Props) {
  const isOpen = () => getActiveModal() !== null;

  useModalHistory({
    isOpen,
    onEscape: closeModal,
    onPopState: clearModals,
  });

  const handleBackdropClick = () => {
    clearModals();
  };

  return (
    <Show when={isOpen()}>
      <Backdrop onClick={handleBackdropClick}>
        {props.children({
          isModalOpen,
          isSubModal,
          activeModal: getActiveModal,
          openModal,
          openSubModal,
          closeModal,
          clearModals,
        })}
      </Backdrop>
    </Show>
  );
}
