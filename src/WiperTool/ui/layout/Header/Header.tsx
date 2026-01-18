import { createSignal, onCleanup, onMount } from 'solid-js';
import { NormalHeader } from './NormalHeader';
import { StickyHeader } from './StickyHeader';

export function Header() {
  let headerRef: HTMLElement | undefined;
  const [showStickyHeader, setShowStickyHeader] = createSignal(false);

  onMount(() => {
    if (!headerRef) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setShowStickyHeader(!entry.isIntersecting), {
      threshold: 0,
    });

    observer.observe(headerRef);
    onCleanup(() => observer.disconnect());
  });

  return (
    <>
      <StickyHeader visible={showStickyHeader()} />
      <NormalHeader
        ref={(el) => {
          headerRef = el;
        }}
      />
    </>
  );
}
