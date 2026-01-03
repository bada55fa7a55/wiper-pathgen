import { Icon, Link } from 'components';
import x6d6178Icon from 'icons/6d6178.svg?raw';
import githubIcon from 'icons/github.svg?raw';
import printablesIcon from 'icons/printables.svg?raw';
import { twc } from 'styles/helpers';
import {
  analyticsFooterAgpl,
  analyticsFooterGitHash,
  analyticsFooterGitHub,
  analyticsFooterGitHubIssues,
  analyticsFooterGitHubPullRequests,
  analyticsFooterHome,
  analyticsFooterPrintablesProfile,
} from './lib/analytics';
import { formatDateISO } from './lib/formatting';

const Container = twc(
  'footer',
  `
  w-full
  flex
  flex-col
  justify-center
  items-center
  gap-2
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
  text-shark-300
  leading-[24px]
  `,
);

const Notice = twc(
  'div',
  `
  `,
);

const FooterLink = twc(
  Link,
  `
  text-shark-200
  hover:text-shark-100
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
  FooterLink,
  `
  inline-flex
  items-center
  gap-2
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
          Build:{' '}
          <FooterLink
            href={`https://github.com/bada55fa7a55/wiper-pathgen/tree/${__GIT_HASH__}`}
            {...analyticsFooterGitHash()}
          >
            <Hash>{__GIT_HASH__.slice(0, 7)}</Hash>
          </FooterLink>{' '}
          / {formatDateISO(new Date(__BUILD_DATE__))}
        </div>
        <LinkList>
          <IconLink
            href="https://github.com/bada55fa7a55/wiper-pathgen"
            {...analyticsFooterGitHub()}
          >
            <Icon
              size={24}
              content={githubIcon}
            />
            GitHub
          </IconLink>
          <IconLink
            href="https://www.printables.com/@6d6178/models"
            {...analyticsFooterPrintablesProfile()}
          >
            <Icon
              size={24}
              content={printablesIcon}
            />
            Printables
          </IconLink>
          <IconLink
            href="https://6d6178.com/"
            {...analyticsFooterHome()}
          >
            <Icon
              size={24}
              content={x6d6178Icon}
            />
            6d6178.com
          </IconLink>
        </LinkList>
      </Content>
      <Content>
        <Notice>
          This project is fully open-source under the{' '}
          <FooterLink
            href="https://www.gnu.org/licenses/agpl-3.0.en.html"
            {...analyticsFooterAgpl()}
          >
            AGPL v3.0
          </FooterLink>
          , built for the community. You are welcome to contribute and make things happen by reporting or contributing
          to{' '}
          <FooterLink
            href="https://github.com/bada55fa7a55/wiper-pathgen/issues"
            {...analyticsFooterGitHubIssues()}
          >
            issues
          </FooterLink>
          , or by testing{' '}
          <FooterLink
            href="https://github.com/bada55fa7a55/wiper-pathgen/pulls"
            {...analyticsFooterGitHubPullRequests()}
          >
            new features
          </FooterLink>{' '}
          or implementing your own.
        </Notice>
      </Content>
    </Container>
  );
}
