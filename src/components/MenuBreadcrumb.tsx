import { Show } from 'solid-js';
import { twc } from 'styles/helpers';

const Container = twc(
  'span',
  `
  inline-flex
  flex-wrap
  gap-x-2
  `,
);

const Crumb = twc(
  'span',
  `
  font-mono
  text-orange-300
  whitespace-nowrap
  font-semibold
  `,
);

type Props = {
  path: string[];
};

export function MenuBreadcrumb({ path }: Props) {
  return (
    <Container>
      {path.map((pathElement, index) => (
        <>
          <Show when={index !== 0}>
            <Crumb>→</Crumb>
          </Show>
          <Crumb>{pathElement}</Crumb>
        </>
      ))}
    </Container>
  );
}
