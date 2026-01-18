import type { PrinterProperties } from 'WiperTool/domain/printers';
import { MaterialSymbol } from 'components';
import { twc } from 'styles';

const StyledButton = twc(
  'button',
  `
  inline-flex
  items-center
  justify-center
  gap-2
  rounded
  font-bold
  transition-colors
  cursor-pointer
  whitespace-nowrap
  disabled:opacity-50
  disabled:cursor-default
  disabled:pointer-events-none
  shrink-0
  relative
  disabled:opacity-100

  bg-zinc-800
  hover:bg-zinc-700
  border
  border-zinc-700
  px-4

  text-sm
  py-2
  `,
  {
    variants: {
      isSelected: {
        false: null,
        true: `
        outline-1
        outline-porange-500
        border-porange-500
        bg-zinc-700
        `,
      },
    },
  },
);

const ButtonContent = twc(
  'div',
  `
  h-full
  w-full
  flex
  shrink-0
  gap-3
  justify-start
  items-center

  sm:flex-col
  sm:justify-end
  sm:items-center
  sm:gap-2
  `,
  {
    variants: {
      isDisabled: {
        false: null,
        true: `
        opacity-40
        `,
      },
    },
  },
);

const PrinterImage = twc(
  'img',
  `
  pointer-events-none
  w-[40px]
  sm:w-[100px]
  `,
  {
    variants: {
      isEnlarged: {
        false: null,
        true: `
          sm:w-[107px]
        `,
      },
    },
  },
);

const PrinterLabel = twc(
  'div',
  `
  text-left
  whitespace-nowrap
  grow
  sm:grow-0
  `,
);

const IconWrapper = twc(
  'div',
  `
  text-porange-500

  sm:hidden
  `,
);

const ButtonOverlay = twc(
  'div',
  `
    absolute
    top-0
    bottom-0
    left-0
    right-0
    
    flex
    flex-row
    justify-end
    items-center
    p-5
    rounded
    bg-zinc-900/25
    text-shark-300
    gap-1

    sm:flex-col-reverse
    sm:justify-center
    sm:items-center
    sm:gap-0
  `,
);

type Props = {
  image: string;
  label: string;
  status: PrinterProperties['status'];
  isSelected: boolean;
  isEnlargedImage?: boolean;
  onClick: () => void;
};

export function PrinterButton(props: Props) {
  const isDisabled = props.status !== 'supported';

  return (
    <StyledButton
      isSelected={props.isSelected}
      disabled={isDisabled}
      onClick={props.onClick}
    >
      <ButtonContent isDisabled={isDisabled}>
        <PrinterImage
          src={props.image}
          isEnlarged={props.isEnlargedImage}
        />
        <PrinterLabel>{props.label}</PrinterLabel>
        {props.isSelected && (
          <IconWrapper>
            <MaterialSymbol
              size={32}
              symbol="check"
            />
          </IconWrapper>
        )}
      </ButtonContent>
      {props.status === 'in-progress' && (
        <ButtonOverlay>
          Work in progress
          <MaterialSymbol
            size={32}
            symbol="build"
          />
        </ButtonOverlay>
      )}
      {props.status === 'planned' && (
        <ButtonOverlay>
          Planned
          <MaterialSymbol
            size={32}
            symbol="lightbulb_2"
          />
        </ButtonOverlay>
      )}
    </StyledButton>
  );
}
