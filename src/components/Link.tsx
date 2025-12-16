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
    },
  },
  defaultVariants: { layout: 'external' },
});
