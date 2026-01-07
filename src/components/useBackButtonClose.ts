import type { Accessor } from 'solid-js';
import { createEffect } from 'solid-js';

let modalDepth = 0;

export function useBackButtonClose(isOpen: Accessor<boolean>, onClose: () => void) {
  let hasConsumedHistory = false;
  let handlePopState: (() => void) | null = null;
  let ownsHistoryEntry = false;
  let storedScrollY: number | null = null;

  const getCurrentScrollY = () => {
    if (typeof window === 'undefined') return 0;

    const scrollY = window.scrollY;
    if (Number.isFinite(scrollY) && scrollY !== 0) {
      return scrollY;
    }

    const bodyTop = window.document?.body?.style?.top;
    const parsedTop = bodyTop ? Number.parseFloat(bodyTop.replace('px', '')) : NaN;
    return Number.isFinite(parsedTop) ? Math.abs(parsedTop) : 0;
  };

  const restoreScrollPosition = () => {
    if (typeof window === 'undefined') return;
    const targetScroll = storedScrollY ?? 0;
    window.requestAnimationFrame(() => window.scrollTo(0, targetScroll));
  };

  const consumeHistory = () => {
    if (hasConsumedHistory || !ownsHistoryEntry || typeof window === 'undefined') {
      return;
    }

    hasConsumedHistory = true;

    if (handlePopState) {
      window.removeEventListener('popstate', handlePopState);
    }

    // Neutralize the modal entry so going forward won't reopen it
    window.history.replaceState({ modal: false }, '', window.location.href);

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.history.back();
    window.history.scrollRestoration = previousScrollRestoration;
    restoreScrollPosition();

    handlePopState = null;
    storedScrollY = null;
    ownsHistoryEntry = false;
  };

  const closeModal = () => {
    consumeHistory();
    onClose();
  };

  createEffect(() => {
    if (!isOpen() || typeof window === 'undefined' || !window.history?.pushState) {
      return;
    }

    hasConsumedHistory = false;

    // Only the first modal in the stack owns the history entry
    ownsHistoryEntry = modalDepth === 0;
    modalDepth += 1;

    if (ownsHistoryEntry) {
      storedScrollY = getCurrentScrollY();

      handlePopState = () => {
        if (hasConsumedHistory) {
          return;
        }

        hasConsumedHistory = true;
        window.removeEventListener('popstate', handlePopState!);
        onClose();
        restoreScrollPosition();
      };

      window.addEventListener('popstate', handlePopState);
      window.history.pushState({ modal: true }, '', window.location.href);
    }

    return () => {
      modalDepth = Math.max(0, modalDepth - 1);
      consumeHistory();
    };
  });

  return { closeModal };
}
