import { createEffect, onCleanup } from 'solid-js';
import { clearModals, getModalStack } from 'WiperTool/store';

let hasHistoryEntry = false;
let handlePopState: (() => void) | null = null;
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

  // Neutralize the modal entry so forward navigation won't reopen it
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

export function useModalHistory() {
  createEffect(() => {
    const modalCount = getModalStack().length;

    if (modalCount > 0 && !hasHistoryEntry) {
      hasHistoryEntry = true;
      storedScrollY = getCurrentScrollY();

      handlePopState = () => {
        if (!hasHistoryEntry) return;
        detachPopState();
        hasHistoryEntry = false;
        clearModals();
        restoreScrollPosition();
      };

      window.addEventListener('popstate', handlePopState);
      window.history.pushState({ modal: true }, '', window.location.href);
    }

    if (modalCount === 0 && hasHistoryEntry) {
      clearHistoryEntry(true);
    }
  });

  onCleanup(() => {
    clearHistoryEntry(true);
  });
}
