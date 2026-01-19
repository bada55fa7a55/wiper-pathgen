import { twc } from '@/styles';

export const CodeTextArea = twc(
  'textarea',
  `
  flex-1
  w-full
  bg-shark-700
  font-mono
  text-sm
  text-emerald-400
  p-4
  rounded
  resize-none
  border
  border-zinc-700
  focus:outline-none
  `,
);
