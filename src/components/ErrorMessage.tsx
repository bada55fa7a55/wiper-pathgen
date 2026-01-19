import type { JSX } from 'solid-js';
import { twc } from '@/styles/helpers';
import { MaterialSymbol } from './MaterialSymbol';

const Container = twc(
  'div',
  `
  flex
  items-start
  gap-3
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

const Content = twc(
  'div',
  `
    grow
  `,
);

const Title = twc(
  'span',
  `
  font-semibold
  text-rose-400
  `,
);

const DismissButton = twc(
  'div',
  `
  cursor-pointer
  text-rose-200
  hover:text-rose-100
  `,
);

const Message = twc('span', ``);

type Props = {
  title: JSX.Element;
  content: JSX.Element;
  onDismiss?: () => void;
};
export function ErrorMessage(props: Props) {
  return (
    <Container>
      <Content>
        <Title>{props.title}</Title> <Message>{props.content}</Message>
      </Content>
      {props.onDismiss && (
        <DismissButton
          title="Dismiss"
          onClick={props.onDismiss}
        >
          <MaterialSymbol
            size={16}
            symbol="close"
          />
        </DismissButton>
      )}
    </Container>
  );
}
