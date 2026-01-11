import type { JSX } from 'solid-js';
import { twc } from 'styles/helpers';
import { MaterialSymbol } from './MaterialSymbol';

const containerStyles = `
  relative
  inline-flex
  items-center
  justify-center
  gap-2
  rounded
  font-bold
  transition-colors
  cursor-pointer
  whitespace-nowrap
  disabled:opacity-50
  disabled:cursor-default
  disabled:pointer-events-none
`;

const containerStylesVariants = {
  variants: {
    layout: {
      primary: `
        bg-orange-600
        hover:bg-orange-500
        active:bg-orange-400
        text-shark-100
        `,
      secondary: `
        bg-zinc-800
        hover:bg-zinc-700
        active:bg-zinc-600
        border
        border-zinc-700
        text-shark-100
        `,
      shark: `
        bg-shark-700
        hover:bg-shark-600
        active:bg-shark-500
        border
        border-shark-500
        text-orange-400
        hover:text-porange-500
        `,
      ghost: `
        hover:bg-zinc-700
        active:bg-zinc-600
        text-shark-200
        `,
      danger: `
        bg-red-600
        text-white
        hover:bg-red-700
        active:bg-red-600
        `,
      list: `
        justify-start
        text-shark-100
        hover:bg-zinc-700
        active:bg-zinc-600
        px-2
        font-normal
        `,
      'list-success': `
        justify-start
        text-emerald-400
        hover:bg-zinc-700
        active:bg-zinc-600
        px-2
        font-normal
        `,
    },
    size: {
      sm: `
        text-xs
        p-1
        leading-6
        `,
      lg: `
        text-sm
        leading-6
        p-2
        `,
      'lg-p0': `
        text-sm
        leading-10
        p-0
        `,
    },
  },
  defaultVariants: {
    layout: 'primary',
    size: 'lg',
  },
} as const;

const ButtonContainer = twc('button', containerStyles, containerStylesVariants);

const LinkContainer = twc('a', containerStyles, containerStylesVariants);

const Overlay = twc(
  'div',
  `
  absolute
  top-0
  bottom-0
  left-0
  right-0

  flex
  justify-center
  items-center

  rounded
  `,
  {
    variants: {
      status: {
        success: `
        bg-emerald-300
        text-emerald-800
        `,
        processing: `
        bg-sky-600
        text-shark-200
        `,
      },
    },
  },
);

const Spinner = twc(
  'span',
  `
  inline-flex
  items-center
  justify-center
  animate-spin
  leading-none
  `,
);

const Label = twc('span', '', {
  variants: {
    isResponsive: {
      false: null,
      true: `
      hidden
      md:inline
      `,
    },
  },
});

type CommonProps = {
  layout: 'primary' | 'secondary' | 'shark' | 'ghost' | 'danger' | 'list' | 'list-success';
  size?: 'lg' | 'sm' | 'lg-p0';
  msIcon?: string;
  title?: string;
  label?: JSX.Element;
  content?: JSX.Element;
  status?: 'success' | 'processing' | undefined;
  iconPosition?: 'left' | 'right';
  isDisabled?: boolean;
  withHiddenLabel?: boolean;
  withResponsiveLabel?: boolean;
};

type Props =
  | (CommonProps & {
      renderAs: 'button';
      type?: 'submit' | 'reset' | 'button';
      ref?: (el: HTMLButtonElement) => void;
      onClick: () => void;
    })
  | (CommonProps & {
      renderAs: 'link';
      href: string;
      ref?: (el: HTMLAnchorElement) => void;
      onClick?: () => void;
    });

export function Button(props: Props) {
  const renderOverlay = () => {
    switch (props.status) {
      case 'success':
        return (
          <Overlay status="success">
            <MaterialSymbol
              size={24}
              symbol="check"
            />
          </Overlay>
        );
      case 'processing':
        return (
          <Overlay status="processing">
            <Spinner style={{ 'transform-origin': '50% 50%' }}>
              <MaterialSymbol
                size={24}
                symbol="progress_activity"
              />
            </Spinner>
          </Overlay>
        );
      default:
        return null;
    }
  };

  switch (props.renderAs) {
    case 'link':
      return (
        <LinkContainer
          layout={props.layout}
          size={props.size}
          href={props.href}
          title={props.title}
          ref={props.ref}
          onClick={props.onClick}
        >
          {props.msIcon && props.iconPosition !== 'right' && (
            <MaterialSymbol
              size={24}
              symbol={props.msIcon}
            />
          )}
          {props.label && !props.withHiddenLabel && (
            <Label isResponsive={props.withResponsiveLabel}>{props.label}</Label>
          )}
          {props.content}
          {props.msIcon && props.iconPosition === 'right' && (
            <MaterialSymbol
              size={24}
              symbol={props.msIcon}
            />
          )}
          {renderOverlay()}
        </LinkContainer>
      );
    case 'button':
      return (
        <ButtonContainer
          layout={props.layout}
          size={props.size}
          type={props.type}
          title={props.title}
          disabled={props.isDisabled}
          onClick={props.onClick}
          ref={props.ref}
        >
          {props.msIcon && props.iconPosition !== 'right' && (
            <MaterialSymbol
              size={24}
              symbol={props.msIcon}
            />
          )}
          {props.label && !props.withHiddenLabel && (
            <Label isResponsive={props.withResponsiveLabel}>{props.label}</Label>
          )}
          {props.content}
          {props.msIcon && props.iconPosition === 'right' && (
            <MaterialSymbol
              size={24}
              symbol={props.msIcon}
            />
          )}
          {renderOverlay()}
        </ButtonContainer>
      );
  }
}
