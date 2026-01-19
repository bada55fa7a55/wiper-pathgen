import type { MaybeElement, MaybeElementAccessor } from '@solidjs-use/shared';
import type { ParentProps } from 'solid-js';
import { createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';
import { keyframes, styled } from 'solid-styled-components';
import { onKeyStroke } from 'solidjs-use';
import { twc } from '@/styles';
import { useFloatingPosition } from './useFloatingPosition';
import { useSafeClickOutside } from './useSafeClickOutside';
import { useScrollLock } from './useScrollLock';
import { getTailwindBreakpointQuery, useTailwindBreakpoint } from './useTailwindBreakpoint';

const Backdrop = twc(
  'div',
  `
  fixed
  top-0
  bottom-0
  left-0
  right-0
  z-40

  bg-black/40
  backdrop-blur-[2px]

  sm:bg-[rgba(255, 255, 255, 0.001)]
  sm:backdrop-blur-0
  `,
);

const Container = twc(
  'div',
  `
  fixed
  inset-x-0
  bottom-0
  z-100
  w-full
  p-4
  pb-[calc(env(safe-area-inset-bottom)+1rem)]

  rounded-t-2xl
  border-t
  border-zinc-700/60
  bg-zinc-800
  shadow-2xl
  shadow-black/50

  max-h-[75vh]
  overflow-y-auto

  sm:fixed
  sm:inset-auto
  sm:z-100
  sm:w-auto
  sm:p-2
  sm:pb-2
  sm:rounded
  sm:border
  sm:border-zinc-700/50
  sm:shadow-md
  sm:shadow-black/40
  sm:max-h-none
  sm:overflow-visible
  `,
);

const drawerIn = keyframes`
  from {
    transform: translateY(16px);
  }
  to {
    transform: translateY(0);
  }
`;

const DrawerContainer = styled(Container)`
  @media ${getTailwindBreakpointQuery('sm', 'max')} {
    animation: ${drawerIn} 200ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Content = twc(
  'div',
  `
    flex
    flex-col
    gap-1
    w-full
    sm:min-w-48
  `,
);

type Props = ParentProps & {
  position: 'left' | 'right' | 'top' | 'bottom';
  backdrop?: boolean;
  onClose?: () => void;
  ignore?: Array<MaybeElementAccessor | string>;
  anchor?: MaybeElementAccessor | MaybeElement;
};

export function Dropdown(props: Props) {
  const [target, setTarget] = createSignal<MaybeElement>(null);
  const isSmallViewport = useTailwindBreakpoint('sm', 'max');
  const resolveAnchor = () => (typeof props.anchor === 'function' ? props.anchor() : props.anchor);

  const floatingStyle = useFloatingPosition({
    getAnchor: resolveAnchor,
    getTarget: target,
    position: () => props.position,
    isSmallViewport,
  });

  useScrollLock(() => true);

  useSafeClickOutside(
    target,
    () => {
      if (props.onClose) {
        props.onClose();
      }
    },
    props.ignore ? { ignore: props.ignore, enabled: () => Boolean(target()) } : { enabled: () => Boolean(target()) },
  );

  onKeyStroke('Escape', () => {
    if (props.onClose) {
      props.onClose();
    }
  });

  const body = (
    <>
      {(props.backdrop || isSmallViewport()) && <Backdrop />}
      <DrawerContainer
        ref={setTarget}
        style={isSmallViewport() ? undefined : floatingStyle()}
      >
        <Content>{props.children}</Content>
      </DrawerContainer>
    </>
  );

  return <Portal>{body}</Portal>;
}
