import { createEffect, onCleanup } from 'solid-js';

let scrollLockCount = 0;
let savedScrollY: number | null = null;
let savedBodyStyle: string | null = null;

function updateBodyOverflow() {
  if (typeof document === 'undefined') {
    return;
  }

  const { body, documentElement: html } = document;
  if (!body || !html) {
    return;
  }

  if (scrollLockCount > 0) {
    if (savedScrollY === null) {
      savedScrollY = window.scrollY;
    }
    if (savedBodyStyle === null) {
      savedBodyStyle = body.getAttribute('style') ?? '';
    }

    html.style.overflowY = 'scroll';
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
  } else {
    body.setAttribute('style', savedBodyStyle ?? '');
    html.style.overflowY = 'scroll';
    savedBodyStyle = null;
    if (savedScrollY !== null) {
      window.scrollTo(0, savedScrollY);
      savedScrollY = null;
    }
  }
}

export function useScrollLock(shouldLock: () => boolean) {
  let isScrollLocked = false;

  createEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (shouldLock()) {
      if (!isScrollLocked) {
        scrollLockCount += 1;
        isScrollLocked = true;
        updateBodyOverflow();
      }
    } else if (isScrollLocked) {
      scrollLockCount -= 1;
      isScrollLocked = false;
      updateBodyOverflow();
    }
  });

  onCleanup(() => {
    if (typeof document === 'undefined') {
      return;
    }
    if (isScrollLocked) {
      scrollLockCount -= 1;
      isScrollLocked = false;
      updateBodyOverflow();
    }
  });
}
