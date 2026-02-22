import type { JSX } from 'solid-js';
import { createUniqueId, For, Show } from 'solid-js';
import { twc } from '@/styles/helpers';
import { MaterialSymbol } from './MaterialSymbol';

const FormField = twc(
  'div',
  `
  flex
  flex-col
  gap-1
  w-full
  `,
);

const FormLabel = twc(
  'label',
  `
  block
  text-xs
  text-orange-400 mb-1
  `,
);

const SelectWrapper = twc(
  'div',
  `
  relative
  w-full
  max-w-64
  `,
);

const Select = twc(
  'select',
  `
  w-full
  bg-zinc-800
  border
  border-zinc-700
  rounded
  text-sm
  py-2
  pl-2
  pr-10
  text-white
  appearance-none
  `,
  {
    variants: {
      invalid: {
        error: `
        border-rose-500
        focus:border-rose-500
        `,
        warning: `
        border-orange-500
        focus:border-orange-500
        `,
      },
      disabled: {
        false: null,
        true: `
        border-zinc-700
        text-zinc-600
        bg-zinc-800
        cursor-not-allowed
        `,
      },
    },
  },
);

const ErrorText = twc(
  'p',
  `
  text-xs
  `,
  {
    variants: {
      type: {
        error: `
        text-rose-400
        `,
        warning: `
        text-orange-400
        `,
      },
    },
  },
);

const Arrow = twc(
  'span',
  `
  pointer-events-none
  absolute
  inset-y-0
  right-3
  flex
  items-center
  text-zinc-500
  `,
);

type ErrorMessage = {
  type: 'error' | 'warning';
  message: string;
};

type SelectOption = {
  key: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  error?: ErrorMessage;
  isDisabled?: boolean;
  onChange: JSX.ChangeEventHandlerUnion<HTMLSelectElement, Event>;
};

export function FormSelect(props: Props) {
  const id = createUniqueId();
  return (
    <FormField>
      <FormLabel for={id}>{props.label}</FormLabel>
      <SelectWrapper>
        <Select
          id={id}
          value={props.value}
          invalid={props.error?.type}
          disabled={props.isDisabled}
          onChange={props.onChange}
        >
          <For each={props.options}>{(option) => <option value={option.key}>{option.label}</option>}</For>
        </Select>
        <Arrow aria-hidden="true">
          <MaterialSymbol
            size={24}
            symbol="arrow_drop_down"
          />
        </Arrow>
      </SelectWrapper>
      <Show
        when={props.error}
        keyed
      >
        {(error) => <ErrorText type={error.type}>{error.message}</ErrorText>}
      </Show>
    </FormField>
  );
}
