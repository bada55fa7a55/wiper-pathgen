import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { useAppModel, useModals } from '@/WiperTool/providers/AppModelProvider';
import type { ModalKey } from '@/WiperTool/ui/modals';
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
  const appModel = useAppModel();
  const modals = useModals();
  const isOpen = () => modals.activeModal() !== null;

  useModalHistory({
    isOpen,
    onEscape: modals.actions.closeModal,
    onPopState: appModel.actions.clearModals,
  });

  const handleBackdropClick = () => {
    appModel.actions.clearModals();
  };

  return (
    <Show when={isOpen()}>
      <Backdrop onClick={handleBackdropClick}>
        {props.children({
          isModalOpen: modals.isModalOpen,
          isSubModal: modals.isSubModalActive,
          activeModal: modals.activeModal,
          openModal: modals.actions.openModal,
          openSubModal: modals.actions.openSubModal,
          closeModal: modals.actions.closeModal,
          clearModals: appModel.actions.clearModals,
        })}
      </Backdrop>
    </Show>
  );
}
