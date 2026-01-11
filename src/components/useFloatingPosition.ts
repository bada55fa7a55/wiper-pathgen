import type { MaybeElement, MaybeElementAccessor } from '@solidjs-use/shared';
import { invariant } from 'lib/invariant';
import { isClientRuntime } from 'lib/runtime';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

type Position = 'left' | 'right' | 'top' | 'bottom';
type Align = 'start' | 'center' | 'end';

const defaultOffset = 8;

type Options = {
  getAnchor: () => MaybeElementAccessor | MaybeElement | null | undefined;
  getTarget: () => MaybeElement | null | undefined;
  position: () => Position;
  isSmallViewport: () => boolean;
  offset?: number;
  align?: () => Align;
};

export function useFloatingPosition(options: Options) {
  const [style, setStyle] = createSignal<JSX.CSSProperties>();

  const resolveAnchor = () => {
    const anchor = options.getAnchor();
    return typeof anchor === 'function' ? anchor() : anchor;
  };

  const updatePosition = () => {
    invariant(window);

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
      const align = options.align?.() ?? 'start';

      if (position === 'top' || position === 'bottom') {
        if (align === 'center') {
          left = anchorRect.left + (anchorRect.width - elRect.width) / 2;
        } else if (align === 'end') {
          left = anchorRect.right - elRect.width;
        } else {
          left = anchorRect.left;
        }
      } else if (position === 'right') {
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
    if (!isClientRuntime) {
      return;
    }

    options.getTarget();
    resolveAnchor();
    options.isSmallViewport();
    options.position();
    updatePosition();
  });

  onMount(() => {
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
