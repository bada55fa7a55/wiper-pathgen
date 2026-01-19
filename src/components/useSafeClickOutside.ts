import type { Fn } from '@solidjs-use/shared';
import { createEffect, onCleanup } from 'solid-js';
import type { MaybeElement, OnClickOutsideHandler, OnClickOutsideOptions } from 'solidjs-use';
import { onClickOutside } from 'solidjs-use';

type SafeClickOutsideOptions = OnClickOutsideOptions & {
  enabled?: () => boolean;
};

/**
 * Wraps solidjs-use's onClickOutside and stops the clock event from bubbling
 */
export function useSafeClickOutside(
  target: MaybeElement | (() => MaybeElement | null | undefined),
  handler: OnClickOutsideHandler,
  options?: SafeClickOutsideOptions,
): Fn | undefined {
  const { enabled: enabledOption, ...restOptions } = options ?? {};
  const resolveTarget = () => (typeof target === 'function' ? target() : target);
  const shouldEnable =
    enabledOption ??
    (() => {
      const el = resolveTarget();
      return Boolean(el && (el as Node).isConnected);
    });
  let stop: Fn | undefined;

  createEffect(() => {
    stop?.();
    stop = undefined;

    if (!shouldEnable()) {
      return;
    }

    stop = onClickOutside(
      target,
      (event) => {
        event?.stopPropagation();
        (event as any)?.stopImmediatePropagation?.();
        handler(event);
      },
      restOptions,
    );
  });

  onCleanup(() => stop?.());

  return stop;
}
