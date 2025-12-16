import type { JSX } from 'solid-js';
import { twc } from 'styles/helpers';

const Container = twc(
  'div',
  `
  px-4
  py-3
  rounded-sm
  border
  border-rose-500/40
  bg-rose-500/10
  text-rose-200
  text-sm
  `,
);

const Title = twc(
  'span',
  `
  font-semibold
  text-rose-400
  `,
);

const Content = twc('span', ``);

type Props = {
  title: JSX.Element;
  content: JSX.Element;
};
export function ErrorMessage({ title, content }: Props) {
  return (
    <Container>
      <Title>{title}</Title> <Content>{content}</Content>
    </Container>
  );
}
