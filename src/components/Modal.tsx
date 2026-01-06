import type { JSX, ParentProps } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import type { MaybeElement } from 'solidjs-use';
import { onKeyStroke } from 'solidjs-use';
import { twc } from 'styles';
import { Button } from './Button';
import { useBackButtonClose } from './useBackButtonClose';
import { useSafeClickOutside } from './useSafeClickOutside';
import { useScrollLock } from './useScrollLock';

const Backdrop = twc(
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

const Container = twc(
  'div',
  `
  top-0
  bottom-0
  left-0
  right-0

  sm:relative
  sm:top-auto
  sm:bottom-auto
  sm:left-auto
  sm:right-auto
  sm:max-w-lg
  sm:rounded-lg

  flex
  flex-col
  
  absolute

  w-full
  max-h-lvh
  overflow-hidden

  animate-in
  zoom-in-95
  duration-200

  bg-neutral-800
  border
  border-shark-900
  shadow-2xl
  shadow-black
  `,
);

const CloseButtonContaier = twc(
  'div',
  `
  absolute
  top-4
  right-4
  `,
  {
    variants: {
      isSmOnly: {
        false: `
        sm:block
        `,
        true: `
        sm:hidden
        `,
      },
    },
  },
);

const Body = twc(
  'div',
  `
  flex
  flex-col
  grow
  gap-4
  p-4
  min-h-0
  `,
);

const Footer = twc(
  'div',
  `
  flex
  flex-col
  gap-4
  p-4

  bg-shark-700
  border-b-1
  border-shark-900
  shadow-md
  `,
);

const Actions = twc(
  'div',
  `
  flex
  justify-end
  gap-3
  `,
);

const FooterContent = twc(
  'div',
  `
  flex
  flex-col
  gap-3
  text-shark-300
  text-xs
  `,
  {
    variants: {
      withActionsAlignment: {
        false: `
        items-center
        `,
        true: `
        items-end
        `,
      },
    },
  },
);

const TitleContainer = twc(
  'div',
  `
  flex
  w-full
  py-2

  border-b
  border-shark-300
  `,
);

const BodyContent = twc(
  'div',
  `
  text-shark-200
  py-4
  flex-1
  min-h-0
  overflow-y-auto
  `,
);

const Title = twc(
  'h3',
  `
  text-lg
  font-semibold
  text-shark-300
  `,
);

type Props = ParentProps & {
  title?: JSX.Element;
  actions?: JSX.Element;
  footerContent?: JSX.Element;
  afterActionsContent?: JSX.Element;
  isOpen: boolean;
  withFooterContentAboveActions?: boolean;
  withCloseButton?: boolean;
  onClose: () => void;
};

export function Modal(props: Props) {
  const [target, setTarget] = createSignal<MaybeElement>(null);
  useScrollLock(() => props.isOpen);
  useBackButtonClose(() => props.isOpen, props.onClose);

  useSafeClickOutside(
    target,
    () => {
      if (props.onClose) {
        props.onClose();
      }
    },
    { enabled: () => props.isOpen },
  );

  onKeyStroke('Escape', () => {
    if (props.onClose) {
      props.onClose();
    }
  });

  return (
    <Portal>
      <Show when={props.isOpen}>
        <Backdrop>
          <Container ref={setTarget}>
            <CloseButtonContaier isSmOnly={!props.withCloseButton}>
              <Button
                renderAs="button"
                layout="ghost"
                size="sm"
                label="Close"
                msIcon="close"
                withHiddenLabel
                onClick={props.onClose}
              />
            </CloseButtonContaier>
            <Body>
              {props.title && (
                <TitleContainer>
                  <Title>{props.title}</Title>
                </TitleContainer>
              )}
              <BodyContent>{props.children}</BodyContent>
            </Body>
            {(props.actions || props.footerContent) && (
              <Footer>
                {props.footerContent && props.withFooterContentAboveActions && (
                  <FooterContent withActionsAlignment={Boolean(props.actions)}>{props.footerContent}</FooterContent>
                )}
                {props.actions && <Actions>{props.actions}</Actions>}
                {props.footerContent && !props.withFooterContentAboveActions && (
                  <FooterContent withActionsAlignment={Boolean(props.actions)}>{props.footerContent}</FooterContent>
                )}
              </Footer>
            )}
          </Container>
        </Backdrop>
      </Show>
    </Portal>
  );
}
