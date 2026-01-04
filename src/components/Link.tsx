import { twc } from 'styles/helpers';

export const Link = twc('a', '', {
  variants: {
    layout: {
      external: `
          text-porange-500
          hover:text-porange-400
        `,
      internal: `
          underline
        `,
      lowkey: `
          text-shark-200
          hover:text-shark-100
          hover:underline
        `,
    },
  },
  defaultVariants: { layout: 'external' },
});
