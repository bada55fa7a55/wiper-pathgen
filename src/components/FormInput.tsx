import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { twc } from '@/styles/helpers';

const FormField = twc(
  'div',
  `
  flex
  flex-col
  gap-1
  w-full
  max-w-64
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

const Input = twc(
  'input',
  `
  w-full
  bg-zinc-800
  border
  border-zinc-700
  rounded
  p-2
  text-sm
  text-white
  `,
  {
    variants: {
      invalid: {
        error: `
        border-rose-500
        focus:border-rose-500
        `,
        warning: `
        border-orange-400
        focus:border-orange-400
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

type ErrorMessage = {
  type: 'error' | 'warning';
  message: string;
};

type Props = {
  label?: string;
  value: string;
  error?: ErrorMessage;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  onInput?: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent>;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
};

export function FormInput(props: Props) {
  return (
    <FormField>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Input
        type="text"
        inputMode="decimal"
        value={props.value}
        invalid={props.error?.type}
        readOnly={props.isReadOnly}
        disabled={props.isDisabled}
        onInput={props.onInput}
        onBlur={props.onBlur}
      />
      <Show
        when={props.error}
        keyed
      >
        {(error) => <ErrorText type={error.type}>{error.message}</ErrorText>}
      </Show>
    </FormField>
  );
}
