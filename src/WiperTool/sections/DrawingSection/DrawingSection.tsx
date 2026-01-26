import { createMemo, Show } from 'solid-js';
import { ErrorMessage, Link, Section, SectionIntro, SectionTitle, WarningMessage } from '@/components';
import { twc } from '@/styles/helpers';
import { wiperArmv2Link } from '@/WiperTool/configuration';
import { analyticsWarningPrintablesWA2 } from '@/WiperTool/lib/analytics';
import { formatMicronsToMmString } from '@/WiperTool/lib/formatting';
import { usePrinters, useSteps } from '@/WiperTool/providers/AppModelProvider';
import { StepKeys } from '@/WiperTool/ui/steps';
import { DrawingPad } from './DrawingPad';
import { GCode } from './GCode';
import { useDrawingPadBoundsWarning } from './helpers';
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
  const { selectedPrinter } = usePrinters();
  const { steps, areStepsCompleteUpTo } = useSteps();

  const { drawingPadBoundsWarning } = useDrawingPadBoundsWarning();
  const isReadyToDraw = () => areStepsCompleteUpTo(StepKeys.Drawing);

  const fullBoundsWarning = createMemo(() => {
    const currentWarning = drawingPadBoundsWarning();
    return currentWarning.kind === 'full' ? currentWarning : null;
  });
  const partialBoundsWarning = createMemo(() => {
    const currentWarning = drawingPadBoundsWarning();
    return currentWarning.kind === 'partial' ? currentWarning : null;
  });

  const isDisabled = () => !isReadyToDraw() || fullBoundsWarning() !== null;

  return (
    <Section id={steps()[StepKeys.Drawing].anchor}>
      <SectionTitle>Draw Wiping Path</SectionTitle>
      <SectionIntro>
        Draw a custom nozzle wiping path or choose a preset. After creating your path, use the{' '}
        <Link
          layout="internal"
          href={`#${steps()[StepKeys.Testing].anchor}`}
        >
          Testing section
        </Link>{' '}
        to try it at a slower speed before adding it to your Start G-code.
      </SectionIntro>
      <Show when={!isReadyToDraw()}>
        <ErrorMessage
          title="Not ready to draw wiping path."
          content={
            <>
              Complete the{' '}
              <Link
                layout="internal"
                href={`#${steps()[StepKeys.Calibration].anchor}`}
              >
                Calibration section
              </Link>{' '}
              and{' '}
              <Link
                layout="internal"
                href={`#${steps()[StepKeys.Settings].anchor}`}
              >
                Settings section
              </Link>{' '}
              forms before drawing your wiping path.
            </>
          }
        />
      </Show>
      <Show when={fullBoundsWarning()}>
        <ErrorMessage
          title="Error: Silicone pad beyond the printer's reach."
          content={
            <>
              Based on the pad calibration and the printer's X and Y ranges, the silicone pad is entirely beyond the
              nozzle's reach. If this seems incorrect, revisit the{' '}
              <Link
                layout="internal"
                href={`#${steps()[StepKeys.Calibration].anchor}`}
              >
                Calibration section
              </Link>{' '}
              and double-check the values.
            </>
          }
        />
      </Show>
      <Show
        when={partialBoundsWarning()}
        keyed
      >
        {(warning) => (
          <WarningMessage
            title="Why is the pad cut off?"
            content={
              <>
                Based on the pad position calibration and the printer's{' '}
                {warning.side === 'top' || warning.side === 'bottom' ? 'Y-axis' : 'X-axis'} range (
                {warning.side === 'top' || warning.side === 'bottom'
                  ? `${formatMicronsToMmString(selectedPrinter().bounds.bottom)}mm - ${formatMicronsToMmString(selectedPrinter().bounds.top)}mm`
                  : `${formatMicronsToMmString(selectedPrinter().bounds.left)}mm - ${formatMicronsToMmString(selectedPrinter().bounds.right)}mm`}
                ), your printer's nozzle cannot reach the full silicone pad. You can still draw a wiping path, but it
                must stay within the reachable area of the pad.
                <br />
                If your current nozzle wiping arm places the silicone pad partially outside the nozzle's reach, check
                out{' '}
                <Link
                  href={wiperArmv2Link.href}
                  {...analyticsWarningPrintablesWA2()}
                >
                  {wiperArmv2Link.label}
                </Link>{' '}
                for a solution that places the silicone pad fully within reach.
              </>
            }
          />
        )}
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
