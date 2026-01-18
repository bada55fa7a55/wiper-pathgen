import { usePrinters, useSteps } from 'WiperTool/providers/AppModelProvider';
import { StepKeys } from 'WiperTool/ui/steps';
import {
  InlineCode,
  Link,
  MenuBreadcrumb,
  Section,
  SectionColumn,
  SectionColumns,
  SectionIntro,
  SectionTitle,
  Step,
  StepBody,
  StepTitle,
} from 'components';

export function InstallationSection() {
  const { selectedPrinter } = usePrinters();
  const { steps } = useSteps();

  return (
    <Section id="installation">
      <SectionTitle>Installation</SectionTitle>
      <SectionIntro>
        Add the wiping G-code from the{' '}
        <Link
          layout="internal"
          href={`#${steps()[StepKeys.Drawing].anchor}`}
        >
          Drawing section
        </Link>{' '}
        to PrusaSlicer so it runs as part of your Start G-code.
      </SectionIntro>
      <SectionColumns>
        <SectionColumn>
          <Step>
            <StepTitle>Copy the Wiping G-Code</StepTitle>
            <StepBody>
              <p>
                In the{' '}
                <Link
                  layout="internal"
                  href={`#${steps()[StepKeys.Drawing].anchor}`}
                >
                  Drawing section
                </Link>
                , click "Copy G-code" above the generated output.
              </p>
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Replace the Existing Cleaning in PrusaSlicer</StepTitle>
            <StepBody>
              <p>
                Open PrusaSlicer and go to{' '}
                <MenuBreadcrumb path={['Printer Settings', 'Custom G-code', 'Start G-code']} />.
              </p>
              <p>
                Find the current nozzle cleaning command (
                <InlineCode>{selectedPrinter().originalCleaningGCode}</InlineCode>) and replace that line with the
                G-code you copied from this tool.
              </p>
              <p>
                Keep the rest of your Start G-code unchanged. Only swap the original cleaning command for your new
                wiping path.
              </p>
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Save and Test</StepTitle>
            <StepBody>
              <p>
                Save the printer profile. Run a small test print and confirm the new wiping path runs in place of the
                old cleaning routine.
              </p>
            </StepBody>
          </Step>
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
