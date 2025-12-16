import { styled } from 'solid-styled-components';

const Container = styled.div`
  overflow: hidden;
  flex-shrink: 0;

  & > svg {
    display: block;
  }
`;

type Props = {
  size: number;
  content: string;
};

export function Icon({ size, content }: Props) {
  return (
    <Container
      innerHTML={content}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
