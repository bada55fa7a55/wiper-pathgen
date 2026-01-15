import { invariant } from 'lib/invariant';
import { isClientRuntime } from 'lib/runtime';
import { createEffect, onCleanup } from 'solid-js';
import { onKeyStroke } from 'solidjs-use';

type ModalHistoryOptions = {
  isOpen: () => boolean;
  onEscape?: () => void;
  onPopState?: () => void;
};

export function useModalHistory(options: ModalHistoryOptions) {
  let hasHistoryEntry = false;
  let handlePopState: (() => void) | null = null;
  let storedScrollY: number | null = null;

  const getCurrentScrollY = () => {
    invariant(window);

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
    invariant(window);

    const targetScroll = storedScrollY ?? 0;
    window.requestAnimationFrame(() => window.scrollTo(0, targetScroll));
  };

  const detachPopState = () => {
    if (handlePopState) {
      invariant(window);

      window.removeEventListener('popstate', handlePopState);
      handlePopState = null;
    }
  };

  const clearHistoryEntry = (shouldGoBack: boolean) => {
    invariant(window);

    if (!hasHistoryEntry) {
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

  onCleanup(() => {
    if (!isClientRuntime) {
      return;
    }

    clearHistoryEntry(true);
  });

  if (options.onEscape) {
    onKeyStroke('Escape', () => {
      if (options.isOpen()) {
        options.onEscape?.();
      }
    });
  }

  createEffect(() => {
    if (!isClientRuntime) {
      return;
    }

    if (options.isOpen() && !hasHistoryEntry) {
      hasHistoryEntry = true;
      storedScrollY = getCurrentScrollY();

      handlePopState = () => {
        if (!hasHistoryEntry) {
          return;
        }

        detachPopState();
        hasHistoryEntry = false;
        options.onPopState?.();
        restoreScrollPosition();
      };

      window.addEventListener('popstate', handlePopState);
      window.history.pushState({ modal: true }, '', window.location.href);
    }

    if (!options.isOpen() && hasHistoryEntry) {
      clearHistoryEntry(true);
    }
  });
}
