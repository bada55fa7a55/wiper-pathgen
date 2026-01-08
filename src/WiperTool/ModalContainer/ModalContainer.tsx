import { clearModals, closeModal, getActiveModal } from 'WiperTool/store';
import type { ParentProps } from 'solid-js';
import { createEffect, onCleanup, Show } from 'solid-js';
import { onKeyStroke } from 'solidjs-use';
import { Backdrop } from './Backdrop';

type Props = ParentProps;

let hasHistoryEntry = false;
let handlePopState: (() => void) | null = null;
let storedScrollY: number | null = null;

const getCurrentScrollY = () => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const scrollY = window.scrollY;
  if (Number.isFinite(scrollY) && scrollY !== 0) {
    return scrollY;
  }

  const bodyTop = window.document?.body?.style?.top;
  if (!bodyTop) {
    return 0;
  }

  const parsedTop = Number.parseFloat(bodyTop.replace('px', ''));
  if (!Number.isFinite(parsedTop)) {
    return 0;
  }

  return Math.abs(parsedTop);
};

const restoreScrollPosition = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const targetScroll = storedScrollY ?? 0;
  window.requestAnimationFrame(() => window.scrollTo(0, targetScroll));
};

const detachPopState = () => {
  if (handlePopState) {
    window.removeEventListener('popstate', handlePopState);
    handlePopState = null;
  }
};

const clearHistoryEntry = (shouldGoBack: boolean) => {
  if (!hasHistoryEntry || typeof window === 'undefined') {
    return;
  }

  detachPopState();

  window.history.replaceState({ modal: false }, '', window.location.href);

  if (shouldGoBack) {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.history.back();
    window.history.scrollRestoration = previousScrollRestoration;
    restoreScrollPosition();
  }

  hasHistoryEntry = false;
  storedScrollY = null;
};

export function ModalContainer(props: Props) {
  onCleanup(() => {
    clearHistoryEntry(true);
  });

  onKeyStroke('Escape', () => {
    if (getActiveModal() !== null) {
      closeModal();
    }
  });

  createEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (getActiveModal() !== null && !hasHistoryEntry) {
      hasHistoryEntry = true;
      storedScrollY = getCurrentScrollY();

      handlePopState = () => {
        if (!hasHistoryEntry) {
          return;
        }

        detachPopState();
        hasHistoryEntry = false;
        clearModals();
        restoreScrollPosition();
      };

      window.addEventListener('popstate', handlePopState);
      window.history.pushState({ modal: true }, '', window.location.href);
    }

    if (getActiveModal() !== null && hasHistoryEntry) {
      clearHistoryEntry(true);
    }
  });

  const handleBackdropClick = () => {
    clearModals();
  };

  return (
    <Show when={getActiveModal() !== null}>
      <Backdrop onClick={handleBackdropClick}>{props.children}</Backdrop>
    </Show>
  );
}
