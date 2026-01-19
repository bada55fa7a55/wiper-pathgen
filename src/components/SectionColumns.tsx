import { twc } from '@/styles/helpers';

export const SectionColumns = twc(
  'div',
  `
  flex
  flex-col
  gap-4
  md:flex-row
  md:gap-8
  `,
);

export const SectionColumn = twc(
  'div',
  `
  flex
  flex-col
  gap-4
  min-w-64
  `,
);
