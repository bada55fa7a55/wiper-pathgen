import { twc } from 'styles/helpers';

export const Button = twc(
  'button',
  `
    inline-flex
    items-center
    justify-center
    rounded
    font-bold
    transition-colors
    cursor-pointer
    whitespace-nowrap
    disabled:opacity-50
    disabled:cursor-default
    disabled:pointer-events-none
  `,
  {
    variants: {
      layout: {
        primary: `
        bg-orange-600
        hover:bg-orange-500
        text-white
        `,
        secondary: `
        bg-zinc-800
        hover:bg-zinc-700
        border
        border-zinc-700
        `,
        danger: `
        bg-red-600
        text-white
        hover:bg-red-700
        `,
      },
      size: {
        sm: `
        text-xs
        px-4
        py-1
        `,
        lg: `
          text-sm
          px-4
          py-2
        `,
      },
    },
    defaultVariants: {
      layout: 'primary',
      size: 'lg',
    },
  },
);
