import { wiperArmv2Link } from 'WiperTool/configuration';
import { formatMicronsToMmString } from 'WiperTool/lib/formatting';
import { isCalibrated, isSettingsComplete, printer } from 'WiperTool/store';
import { ErrorMessage, Link, Section, SectionIntro, SectionTitle, WarningMessage } from 'components';
import { Show } from 'solid-js';
import { twc } from 'styles/helpers';
import { DrawingPad } from './DrawingPad';
import { GCode } from './GCode';
import { isPadCutOff, isPadInvisible, padCutOffWarning } from './helpers';
import { PresetButtons } from './PresetButtons';

const DrawingContainer = twc(
  'div',
  `
  flex
  flex-col
  lg:flex-row
  gap-4
  items-stretch
  `,
  {
    variants: {
      disabled: {
        true: `
        pointer-events-none
        opacity-50
        `,
      },
    },
  },
);

const DrawingPadWrapper = twc(
  'div',
  `
  lg:w-3/5
  `,
);

const GCodeWrapper = twc(
  'div',
  `
  lg:w-2/5
  `,
);

export function DrawingSection() {
  const isReadyToDraw = () => isCalibrated() && isSettingsComplete();
  const isDisabled = () => !isReadyToDraw();

  return (
    <Section id="drawing">
      <SectionTitle>Draw Wiping Path</SectionTitle>
      <SectionIntro>
        Draw a custom nozzle wiping path or choose a preset. After creating your path, use the{' '}
        <Link
          layout="internal"
          href="#testing"
        >
          Testing section
        </Link>{' '}
        to try it at a slower speed before adding it to your Start G-code.
      </SectionIntro>
      <Show when={!isReadyToDraw()}>
        <ErrorMessage
          title="Error: Incomplete calibration or settings."
          content={
            <>
              Complete the{' '}
              <Link
                layout="internal"
                href="#calibration"
              >
                calibration section
              </Link>{' '}
              and{' '}
              <Link
                layout="internal"
                href="#settings"
              >
                settings section
              </Link>{' '}
              forms before drawing the wiping path.
            </>
          }
        />
      </Show>
      <Show when={isPadInvisible()}>
        <ErrorMessage
          title="Error: Silicone pad beyond the printer's reach."
          content={
            <>
              Based on the pad calibration and the printer's X and Y ranges, the silicone pad is entirely beyond the
              nozzle's reach. If this seems incorrect, revisit the{' '}
              <Link
                layout="internal"
                href="#calibration"
              >
                calibration section
              </Link>{' '}
              and double-check the values.
            </>
          }
        />
      </Show>
      <Show when={isPadCutOff()}>
        <WarningMessage
          title="Why is the pad cut off?"
          content={
            <>
              Based on the pad position calibration and the printer's{' '}
              {padCutOffWarning() === 'top' || padCutOffWarning() === 'bottom' ? 'Y-axis' : 'X-axis'} range (
              {padCutOffWarning() === 'top' || padCutOffWarning() === 'bottom'
                ? `${formatMicronsToMmString(printer().minY)}mm - ${formatMicronsToMmString(printer().maxY)}mm`
                : `${formatMicronsToMmString(printer().minX)}mm - ${formatMicronsToMmString(printer().maxX)}mm`}
              ), your printer's nozzle cannot reach the full silicone pad. You can still draw a wiping path, but it must
              stay within the reachable area of the pad.
              <br />
              If your current nozzle wiping arm places the silicone pad partly outside the nozzle's reach, check out{' '}
              <Link href={wiperArmv2Link.href}>{wiperArmv2Link.label}</Link> for a solution that places the silicone pad
              fully within reach.
            </>
          }
        />
      </Show>
      <PresetButtons />
      <DrawingContainer disabled={isDisabled()}>
        <DrawingPadWrapper>
          <DrawingPad />
        </DrawingPadWrapper>
        <GCodeWrapper>
          <GCode />
        </GCodeWrapper>
      </DrawingContainer>
    </Section>
  );
}
