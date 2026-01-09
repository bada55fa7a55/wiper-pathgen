import type { Accessor } from 'solid-js';
import { createSignal, onCleanup, onMount } from 'solid-js';
import defaultTheme from 'tailwindcss/defaultTheme';

type Breakpoint = keyof typeof defaultTheme.screens;
type Mode = 'min' | 'max';

export function getTailwindBreakpointQuery(breakpoint: Breakpoint, mode: Mode = 'min') {
  const value = defaultTheme.screens[breakpoint];
  if (mode === 'max') {
    return `(max-width: calc(${value} - 0.0001rem))`;
  }
  return `(min-width: ${value})`;
}

export function useTailwindBreakpoint(breakpoint: Breakpoint, mode: Mode = 'max'): Accessor<boolean> {
  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    const media = window.matchMedia(getTailwindBreakpointQuery(breakpoint, mode));
    const update = () => setMatches(media.matches);
    update();

    if ('addEventListener' in media) {
      media.addEventListener('change', update);
      onCleanup(() => media.removeEventListener('change', update));
      return;
    }

    // biome-ignore lint/suspicious/noTsIgnore: see below
    // @ts-ignore legacy Safari support; safe to ignore in modern targets.
    media.addListener(update);
    // biome-ignore lint/suspicious/noTsIgnore: see below
    // @ts-ignore legacy Safari support; safe to ignore in modern targets.
    onCleanup(() => media.removeListener(update));
  });

  return matches;
}
