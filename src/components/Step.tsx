import { twc } from '@/styles/helpers';

export const Step = twc(
  'div',
  `
  flex
  flex-col
  gap-2
  `,
);

export const StepTitle = twc('h3', `text-lg text-orange-400`);

export const StepBody = twc(
  'div',
  `
  flex
  flex-col
  align-start
  gap-2
`,
);
