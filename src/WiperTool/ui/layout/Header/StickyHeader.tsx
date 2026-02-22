import { twc } from '@/styles/helpers';
import logo from './assets/logo-small.svg?url';
import { DropdownMenuButton } from './DropdownMenuButton';
import { StepOMeter } from './StepOMeter';
import { StepOMeterDropdownButton } from './StepOMeterDropdownButton';

const Container = twc(
  'div',
  `
  fixed
  inset-x-0
  top-0
  z-40
  pointer-events-none
  `,
);

const StickyBar = twc(
  'div',
  `
  flex
  items-center
  justify-between
  gap-4
  w-full
  px-4
  py-3

  bg-neutral-900
  border-b-1
  border-shark-900
  shadow-md

  pointer-events-auto

  transition-all
  duration-300

  md:px-8
  `,
  {
    variants: {
      visible: {
        false: `
      opacity-0
      -translate-y-full
      `,
        true: `
      opacity-100
      translate-y-0
      `,
      },
    },
  },
);

const Logo = twc('img', ``);

const LeftSection = twc(
  'div',
  `
  grow
  flex
  justify-start
  items-center
  gap-4
  sm:gap-8
  min-h-[42px]
  `,
);

const RightSection = twc(
  'div',
  `
  flex
  justify-start
  items-center
  gap-3
  `,
);

type Props = {
  visible: boolean;
};

export function StickyHeader(props: Props) {
  return (
    <Container aria-hidden="true">
      <StickyBar visible={props.visible}>
        <LeftSection>
          <Logo
            alt="Nozzle Wiper Path Generator compact logo"
            src={logo}
            width={182}
            height={40}
          />
          <StepOMeter />
        </LeftSection>
        <RightSection>
          <StepOMeterDropdownButton />
          <DropdownMenuButton layout="secondary" />
        </RightSection>
      </StickyBar>
    </Container>
  );
}
