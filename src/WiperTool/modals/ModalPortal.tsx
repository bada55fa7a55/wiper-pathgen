import { isClientRuntime } from 'lib/runtime';
import type { ParentProps } from 'solid-js';
import { Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Backdrop } from './Backdrop';
import { useModalHistory } from './useModalHistory';

type Props = ParentProps & {
  isOpen: () => boolean;
  onClose: () => void;
};

export function ModalPortal(props: Props) {
  useModalHistory({
    isOpen: props.isOpen,
    onEscape: props.onClose,
    onPopState: props.onClose,
  });

  return (
    <Show when={isClientRuntime && props.isOpen()}>
      <Portal>
        <Backdrop onClick={props.onClose}>{props.children}</Backdrop>
      </Portal>
    </Show>
  );
}
