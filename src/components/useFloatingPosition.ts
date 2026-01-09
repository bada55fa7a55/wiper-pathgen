import type { MaybeElement, MaybeElementAccessor } from '@solidjs-use/shared';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

type Position = 'left' | 'right' | 'top' | 'bottom';

const defaultOffset = 8;

type Options = {
  getAnchor: () => MaybeElementAccessor | MaybeElement | null | undefined;
  getTarget: () => MaybeElement | null | undefined;
  position: () => Position;
  isSmallViewport: () => boolean;
  offset?: number;
};

export function useFloatingPosition(options: Options) {
  const [style, setStyle] = createSignal<JSX.CSSProperties>();

  const resolveAnchor = () => {
    const anchor = options.getAnchor();
    return typeof anchor === 'function' ? anchor() : anchor;
  };

  const updatePosition = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (options.isSmallViewport()) {
      setStyle(undefined);
      return;
    }

    const anchor = resolveAnchor();
    const el = options.getTarget();
    if (!anchor || !el) {
      return;
    }

    window.requestAnimationFrame(() => {
      const anchorRect = anchor.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = options.offset ?? defaultOffset;
      let left = anchorRect.left;
      let top = anchorRect.bottom + offset;
      const position = options.position();

      if (position === 'right' || position === 'top') {
        left = anchorRect.right - elRect.width;
      }
      if (position === 'top') {
        top = anchorRect.top - elRect.height - offset;
      }

      const minLeft = defaultOffset;
      const maxLeft = window.innerWidth - elRect.width - defaultOffset;
      left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));

      const minTop = defaultOffset;
      const maxTop = window.innerHeight - elRect.height - defaultOffset;
      top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));

      setStyle({ top: `${Math.round(top)}px`, left: `${Math.round(left)}px` });
    });
  };

  createEffect(() => {
    options.getTarget();
    resolveAnchor();
    options.isSmallViewport();
    options.position();
    updatePosition();
  });

  onMount(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleUpdate = () => updatePosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    onCleanup(() => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    });
  });

  return style;
}
