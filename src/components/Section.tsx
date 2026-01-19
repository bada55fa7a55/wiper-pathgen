import type { ParentProps } from 'solid-js';
import { twc } from '@/styles/helpers';

const Container = twc(
  'div',
  `
  w-full
  px-4
  md:px-8
  flex
  flex-col
  gap-4
  `,
);

const Anchor = twc(
  'a',
  `
    -translate-[60px]
  `,
);

type Props = ParentProps & {
  id: string;
};

export function Section(props: Props) {
  return (
    <Container>
      <Anchor name={props.id} />
      {props.children}
    </Container>
  );
}
