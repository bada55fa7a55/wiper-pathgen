import { wiperArmv2Link } from 'WiperTool/configuration';
import { analyticsHeaderPrintablesWA2 } from 'WiperTool/lib/analytics';
import { Link } from 'components';
import { styled } from 'solid-styled-components';
import { twc } from 'styles/helpers';
import logo from './assets/logo.svg?url';

const Container = twc(
  'header',
  `
  w-full
  flex
  flex-col
  items-center
  gap-6
  py-10
  bg-neutral-900
  px-4
  `,
);

const PageTitle = twc(
  'h1',
  `
  text-4xl
  select-none
  text-transparent
  bg-size-[100%]
  bg-no-repeat
  w-[310px]
  h-[120px]
  sm:w-[456px]
  sm:h-[180px]
  lg:w-[620px]
  lg:h-[240px]
  `,
);

const Logo = styled(PageTitle)`
  background-image: url(${logo});
`;

const TagLines = twc(
  'div',
  `
  flex
  flex-col
  gap-2
  md:w-3/4
  w-full
  text-lg
  `,
);

const TagLine = twc(
  'div',
  `
  text-lg
  text-center
  text-shark-100
  `,
);

const Disclaimers = twc(
  'div',
  `flex
  flex-col
  gap-2
  md:w-3/4
  w-full
  text-lg`,
);

const Disclaimer = twc(
  'div',
  `text-sm
  text-center
  text-shark-400`,
);

type Props = {
  ref?: (el: HTMLElement) => void;
};

export function NormalHeader(props: Props) {
  return (
    <Container ref={props.ref}>
      <Logo>Nozzle Wiper Path Generator For Prusa Core One</Logo>
      <TagLines>
        <TagLine>
          Generate wiping paths for the Prusa CORE&nbsp;ONE using Bambu Lab A1 or equivalent silicone nozzle wiping
          pads.
        </TagLine>
        <TagLine>
          Companion tool for the{' '}
          <Link
            href={wiperArmv2Link.href}
            {...analyticsHeaderPrintablesWA2()}
          >
            {wiperArmv2Link.label}
          </Link>{' '}
          and similar nozzle wipers.
        </TagLine>
      </TagLines>
      <Disclaimers>
        <Disclaimer>
          This tool generates machine code. Review the G-code before printing. The author is not responsible for any
          damage. The software is provided "as is." Use at your own risk.
        </Disclaimer>
        <Disclaimer>
          This software is an unofficial, community-driven project. It is not affiliated with or endorsed by Prusa
          Research or Bambu Lab.
        </Disclaimer>
      </Disclaimers>
    </Container>
  );
}
