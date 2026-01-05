import type { MaybeElement, MaybeElementAccessor } from '@solidjs-use/shared';
import type { ParentProps } from 'solid-js';
import { createSignal } from 'solid-js';
import { onClickOutside, onKeyStroke } from 'solidjs-use';
import { twc } from 'styles';

const Backdrop = twc(
  'div',
  `
  fixed
  top-0
  bottom-0
  left-0
  right-0
  bg-[rgba(255, 255, 255, 0.001)]
  `,
);

const Container = twc(
  'div',
  `
  absolute
  z-10
  p-2
  
  rounded
  bg-zinc-800
  shadow-md
  `,
  {
    variants: {
      position: {
        left: `
        left-0
        translate-y-2
        `,
        right: `
        right-0
        translate-y-2
        `,
        top: `
        right-0
        bottom-0
        `,
        bottom: `
        top-0
        `,
      },
    },
  },
);

const Content = twc(
  'div',
  `
    flex
    flex-col
    gap-1
    min-w-48
  `,
);

type Props = ParentProps & {
  position: 'left' | 'right' | 'top' | 'bottom';
  backdrop?: boolean;
  onClose?: () => void;
  ignore?: Array<MaybeElementAccessor | string>;
};

export function Dropdown(props: Props) {
  const [target, setTarget] = createSignal<MaybeElement>(null);

  onClickOutside(
    target,
    () => {
      if (props.onClose) {
        props.onClose();
      }
    },
    props.ignore ? { ignore: props.ignore } : undefined,
  );

  onKeyStroke('Escape', () => {
    if (props.onClose) {
      props.onClose();
    }
  });

  return (
    <>
      {props.backdrop && <Backdrop />}
      <Container
        ref={setTarget}
        position={props.position}
      >
        <Content>{props.children}</Content>
      </Container>
    </>
  );
}
