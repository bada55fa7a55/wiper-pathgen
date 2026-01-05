import { analyticsHwSetupGitHubIssues, analyticsHwSetupGitHubPullRequests } from 'WiperTool/lib/analytics';
import { StepKey, steps } from 'WiperTool/store';
import { Link, Section, SectionColumn, SectionColumns, SectionIntro, SectionTitle } from 'components';
import { twc } from 'styles';
import { PrinterPicker } from './PrinterPicker/PrinterPicker';

const Notice = twc(
  'div',
  `
  text-sm
  text-shark-300
  `,
);

export function HardwareSetupSection() {
  return (
    <Section id={steps()[StepKey.SelectPrinter].anchor}>
      <SectionTitle>Select Your Printer</SectionTitle>
      <SectionIntro>
        <p>
          The tool will consider the printer's constraints and properties to adjust the instructions, G-code generation,
          and drawing area.
        </p>
      </SectionIntro>
      <SectionColumns>
        <SectionColumn>
          <PrinterPicker />
          <Notice>
            Is your printer not supported yet? Check out open{' '}
            <Link
              layout="lowkey"
              href="https://github.com/bada55fa7a55/wiper-pathgen/pulls"
              {...analyticsHwSetupGitHubPullRequests()}
            >
              pull requests
            </Link>{' '}
            or{' '}
            <Link
              layout="lowkey"
              href="https://github.com/bada55fa7a55/wiper-pathgen/issues"
              {...analyticsHwSetupGitHubIssues()}
            >
              issues
            </Link>{' '}
            to see how you can contribute to advance the progress.
          </Notice>
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
