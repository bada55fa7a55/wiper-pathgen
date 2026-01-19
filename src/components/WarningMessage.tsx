import type { JSX } from 'solid-js';
import { twc } from '@/styles/helpers';

const Container = twc(
  'div',
  `
  px-4
  py-3
  rounded-sm
  border
  border-amber-500/40
  bg-amber-500/10
  text-amber-200
  text-sm
  `,
);

const Title = twc(
  'span',
  `
  font-semibold
  text-amber-400
  `,
);

const Content = twc('span', ``);

type Props = {
  title: JSX.Element;
  content: JSX.Element;
};
export function WarningMessage({ title, content }: Props) {
  return (
    <Container>
      <Title>{title}</Title> <Content>{content}</Content>
    </Container>
  );
}
