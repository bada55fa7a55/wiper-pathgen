import type { JSX, ParentProps } from 'solid-js';
import { useScrollLock } from '@/components';
import { twc } from '@/styles';

const Container = twc(
  'div',
  `
  fixed
  inset-0
  flex
  justify-center
  items-center
  p-4

  animate-in
  fade-in
  duration-200

  z-50

  bg-black/50
  backdrop-blur-sm
  `,
);

type Props = ParentProps & {
  onClick: () => void;
};

export function Backdrop(props: Props) {
  useScrollLock(() => true);

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    props.onClick();
  };

  return <Container onClick={handleClick}>{props.children}</Container>;
}
