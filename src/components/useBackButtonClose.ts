import type { Accessor } from 'solid-js';
import { createEffect } from 'solid-js';

export function useBackButtonClose(isOpen: Accessor<boolean>, onClose: () => void) {
  createEffect(() => {
    if (!isOpen() || typeof window === 'undefined' || !window.history?.pushState) return;

    let hasConsumedHistory = false;

    const handlePopState = () => {
      if (hasConsumedHistory) return;
      hasConsumedHistory = true;
      window.removeEventListener('popstate', handlePopState);
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    window.history.pushState({ modal: true }, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!hasConsumedHistory) {
        hasConsumedHistory = true;
        window.history.back();
      }
    };
  });
}
