import { Icon, Link } from 'components';
import x6d6178Icon from 'icons/6d6178.svg?raw';
import githubIcon from 'icons/github.svg?raw';
import printablesIcon from 'icons/printables.svg?raw';
import { twc } from 'styles/helpers';
import { formatDateISO } from './lib/formatting';

const Container = twc(
  'footer',
  `
  w-full
  flex
  flex-col
  justify-center
  items-center
  gap-6
  py-10
  bg-neutral-900
  `,
);

const Content = twc(
  'div',
  `
  w-full
  px-10
  max-w-screen-xl
  flex
  flex-col
  md:flex-row
  items-start
  justify-between
  gap-3
  text-sm
  text-shark-100
  leading-[24px]
  `,
);

const LinkList = twc(
  'div',
  `
  flex
  flex-col
  gap-1
  md:gap-8
  md:flex-row-reverse
  `,
);

const IconLink = twc(
  Link,
  `
  inline-flex
  items-center
  gap-2
  text-shark-200
  hover:text-shark-100
  `,
);

const Hash = twc(
  'code',
  `
  font-mono
  font-bold
  `,
);

export function Footer() {
  return (
    <Container>
      <Content>
        <div>
          Build: <Hash>{__GIT_HASH__}</Hash> / {formatDateISO(new Date(__BUILD_DATE__))}
        </div>
        <LinkList>
          <IconLink href="https://github.com/bada55fa7a55/wiper-pathgen">
            <Icon
              size={24}
              content={githubIcon}
            />
            GitHub
          </IconLink>
          <IconLink href="https://www.printables.com/@6d6178/models">
            <Icon
              size={24}
              content={printablesIcon}
            />
            Printables
          </IconLink>
          <IconLink href="https://6d6178.com/">
            <Icon
              size={24}
              content={x6d6178Icon}
            />
            6d6178.com
          </IconLink>
        </LinkList>
      </Content>
    </Container>
  );
}
