import { PrinterKeys } from 'WiperTool/domain/printers';
import { useSettings, useSteps } from 'WiperTool/providers/AppModelProvider';
import { StepKeys } from 'WiperTool/ui/steps';
import { Section, SectionIntro, SectionTitle } from 'components';
import { CoreOneInstructions } from './CoreOneInstructions';

export function ClaibrationSection() {
  const settings = useSettings();
  const { steps } = useSteps();

  return (
    <Section id={steps()[StepKeys.Calibration].anchor}>
      <SectionTitle>Silicone Pad Position Calibration</SectionTitle>
      <SectionIntro>
        <p>
          Use this section to record the silicone pad position so the tool can calculate the wiping coordinates
          accurately.
        </p>
      </SectionIntro>
      {(() => {
        const printer = settings.printer();

        switch (printer) {
          case PrinterKeys.PrusaCoreOne:
          case PrinterKeys.PrusaCoreOneL:
          case PrinterKeys.PrusaXl:
          case PrinterKeys.PrusaMk4:
            return <CoreOneInstructions />;
          default: {
            return unreachable(printer);
          }
        }
      })()}
    </Section>
  );
}
