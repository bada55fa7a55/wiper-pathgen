import { PrinterKey } from 'WiperTool/configuration';
import { StepKey, settings, steps } from 'WiperTool/store';
import { Section, SectionIntro, SectionTitle } from 'components';
import { CoreOneInstructions } from './CoreOneInstructions';

export function ClaibrationSection() {
  return (
    <Section id={steps()[StepKey.Calibration].anchor}>
      <SectionTitle>Silicone Pad Position Calibration</SectionTitle>
      <SectionIntro>
        <p>
          Use this section to record the silicone pad position so the tool can calculate the wiping coordinates
          accurately.
        </p>
      </SectionIntro>
      {(() => {
        switch (settings.printer) {
          case PrinterKey.PrusaCoreOne:
          case PrinterKey.PrusaCoreOneL:
          case PrinterKey.PrusaXl:
          case PrinterKey.PrusaMk4:
            return <CoreOneInstructions />;
          default: {
            return unreachable(settings.printer);
          }
        }
      })()}
    </Section>
  );
}
