import type { Accessor } from 'solid-js';
import { createEffect } from 'solid-js';

export function useBackButtonClose(isOpen: Accessor<boolean>, onClose: () => void) {
  let hasConsumedHistory = false;
  let handlePopState: (() => void) | null = null;

  const consumeHistory = () => {
    if (hasConsumedHistory || typeof window === 'undefined') {
      return;
    }

    hasConsumedHistory = true;

    if (handlePopState) {
      window.removeEventListener('popstate', handlePopState);
    }

    if (window.history.state?.modal) {
      const previousScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      window.history.back();
      window.history.scrollRestoration = previousScrollRestoration;
    }
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

    handlePopState = () => {
      if (hasConsumedHistory) {
        return;
      }

      hasConsumedHistory = true;
      window.removeEventListener('popstate', handlePopState!);
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    window.history.pushState({ modal: true }, '', window.location.href);

    return () => {
      consumeHistory();
    };
  });

  return { closeModal };
}
