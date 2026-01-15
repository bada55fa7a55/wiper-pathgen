import type { MaybeElement, MaybeElementAccessor } from '@solidjs-use/shared';
import type { ParentProps } from 'solid-js';
import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { twc } from 'styles';
import { useFloatingPosition } from './useFloatingPosition';

const Container = twc(
  'div',
  `
  hidden
  sm:block

  fixed
  z-100
  px-3
  py-2
  -translate-y-1

  rounded
  bg-shark-900
  shadow-lg
  text-shark-100
  text-sm

  pointer-events-none
  `,
  {
    variants: {
      position: {
        top: `
          translate-y-1
        `,
        bottom: `
          -translate-y-1
        `,
        left: null,
        right: null,
      },
    },
  },
);

type Props = ParentProps & {
  anchor: MaybeElementAccessor | MaybeElement;
  isOpen?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  offset?: number;
  class?: string;
};

export function Tooltip(props: Props) {
  const [target, setTarget] = createSignal<MaybeElement>(null);
  const [isHovered, setIsHovered] = createSignal(false);

  const isOpen = createMemo(() => (props.isOpen === undefined ? isHovered() : props.isOpen));

  const floatingStyle = useFloatingPosition({
    getAnchor: () => props.anchor,
    getTarget: target,
    position: () => props.position ?? 'top',
    align: () => props.align ?? 'center',
    offset: props.offset,
    isSmallViewport: () => false,
  });

  createEffect(() => {
    const anchor = typeof props.anchor === 'function' ? props.anchor() : props.anchor;
    if (!anchor) {
      return;
    }

    const handleEnter = () => {
      setIsHovered(true);
    };

    const handleLeave = () => {
      setIsHovered(false);
    };

    anchor.addEventListener('mouseenter', handleEnter);
    anchor.addEventListener('mouseleave', handleLeave);
    anchor.addEventListener('focus', handleEnter);
    anchor.addEventListener('blur', handleLeave);

    onCleanup(() => {
      anchor.removeEventListener('mouseenter', handleEnter);
      anchor.removeEventListener('mouseleave', handleLeave);
      anchor.removeEventListener('focus', handleEnter);
      anchor.removeEventListener('blur', handleLeave);
    });
  });

  return (
    <Show when={isOpen()}>
      <Portal>
        <Container
          ref={setTarget}
          style={floatingStyle()}
          position={props.position}
          class={props.class}
          role="tooltip"
        >
          {props.children}
        </Container>
      </Portal>
    </Show>
  );
}
