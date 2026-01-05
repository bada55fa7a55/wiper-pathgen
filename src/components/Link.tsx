import { twc } from 'styles/helpers';

export const Link = twc(
  'a',
  `
    inline-flex
    items-center
    gap-1.5
    whitespace-nowrap
  `,
  {
    variants: {
      inheritColor: {
        false: '',
        true: 'text-inherit',
      },
      layout: {
        external: '',
        internal: 'underline',
        lowkey: 'hover:underline',
      },
    },
    compoundVariants: [
      {
        inheritColor: 'false',
        layout: 'external',
        class: `
          text-porange-500
          hover:text-porange-400
        `,
      },
      {
        inheritColor: 'false',
        layout: 'lowkey',
        class: `
          text-shark-200
          hover:text-shark-100
        `,
      },
    ],
    defaultVariants: { layout: 'external', inheritColor: 'false' },
  },
);
