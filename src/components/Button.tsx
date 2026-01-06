import type { JSX } from 'solid-js';
import { twc } from 'styles/helpers';
import { MaterialSymbol } from './MaterialSymbol';

const containerStyles = `
  inline-flex
  items-center
  justify-center
  gap-1
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
        text-shark-100
        `,
      secondary: `
        bg-zinc-800
        hover:bg-zinc-700
        border
        border-zinc-700
        text-shark-100
        `,
      danger: `
        bg-red-600
        text-white
        hover:bg-red-700
        `,
      list: `
        justify-start
        text-shark-100
        hover:bg-zinc-700
        px-2
        font-normal
        `,
      'list-success': `
        justify-start
        text-emerald-400
        hover:bg-zinc-700
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
    },
  },
  defaultVariants: {
    layout: 'primary',
    size: 'lg',
  },
} as const;

export const ButtonContainer = twc('button', containerStyles, containerStylesVariants);

export const LinkContainer = twc('a', containerStyles, containerStylesVariants);

type CommonProps = {
  layout: 'primary' | 'secondary' | 'danger' | 'list' | 'list-success';
  size?: 'lg' | 'sm';
  msIcon?: string;
  title?: string;
  label: JSX.Element;
  isDisabled?: boolean;
  withHiddenLabel?: boolean;
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
          {props.msIcon && (
            <MaterialSymbol
              size={24}
              symbol={props.msIcon}
            />
          )}
          {!props.withHiddenLabel && props.label}
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
          {props.msIcon && (
            <MaterialSymbol
              size={24}
              symbol={props.msIcon}
            />
          )}
          {!props.withHiddenLabel && props.label}
        </ButtonContainer>
      );
  }
}
