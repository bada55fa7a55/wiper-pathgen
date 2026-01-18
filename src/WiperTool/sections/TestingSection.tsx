import { calibrationValuesUsedEvent, testGCodeDownloadedEvent, track } from 'WiperTool/lib/analytics';
import { formatPercent, formatPercentString } from 'WiperTool/lib/formatting';
import { generateTestGCodeCommands } from 'WiperTool/lib/gcode';
import {
  useCalibration,
  usePads,
  usePrinters,
  useSettings,
  useSteps,
  useTracking,
  useWipingSequence,
} from 'WiperTool/providers/AppModelProvider';
import { StepKeys } from 'WiperTool/ui/steps';
import {
  Button,
  ErrorMessage,
  FormSelect,
  Link,
  Section,
  SectionColumn,
  SectionColumns,
  SectionIntro,
  SectionTitle,
  Step,
  StepBody,
  StepTitle,
} from 'components';
import { createMemo, createSignal, Show } from 'solid-js';
import { twc } from 'styles/helpers';

const ButtonWrapper = twc(
  'div',
  `
  flex
  `,
);

const FormRow = twc(
  'div',
  `
  grid
  grid-rows-1
  md:grid-cols-3
  gap-4
  `,
);

const Content = twc(
  'div',
  `
  flex
  flex-col
  gap-6
  `,
);

const Description = twc(
  'div',
  `
  flex
  flex-col
  gap-3
  `,
);

const OrderedList = twc(
  'ol',
  `
  list-outside
  list-decimal
  px-8
  text-md
  `,
);

const StrongEmphasis = twc(
  'p',
  `
  border-l-6
  border-porange-500
  py-1
  pl-4
  `,
);

export function TestingSection() {
  const { selectedPrinter } = usePrinters();
  const { selectedPadTopRight } = usePads();
  const calibration = useCalibration();
  const settings = useSettings();
  const wipingSequence = useWipingSequence();
  const tracking = useTracking();
  const { steps, areStepsCompleteUpTo } = useSteps();

  const [feedRateMultiplier, setFeedRateMultiplier] = createSignal<string>('0.05');
  const feedRateMultiplierValue = createMemo(() => Number(feedRateMultiplier()));

  const testGCode = createMemo(() => {
    const feedRate = settings.feedRate();
    const plungeDepth = settings.plungeDepth();
    const zLift = settings.zLift();
    const x = calibration.x();
    const y = calibration.y();
    const z = calibration.z();

    if (
      !wipingSequence.isComplete() ||
      x === undefined ||
      y === undefined ||
      z === undefined ||
      feedRate === undefined ||
      plungeDepth === undefined ||
      zLift === undefined
    ) {
      return null;
    }

    return (
      generateTestGCodeCommands({
        printerName: selectedPrinter().name,
        printerOriginalCleaningGcode: selectedPrinter().originalCleaningGCode,
        printerId: selectedPrinter().printerId,
        printerMaxCoords: {
          x: selectedPrinter().maxX,
          y: selectedPrinter().maxY,
        },
        printerParkingCoords: {
          x: selectedPrinter().parkingCoords.x,
          y: selectedPrinter().parkingCoords.y,
          z: selectedPrinter().parkingZHeight,
        },
        padRef: {
          x,
          y,
          z,
        },
        wipingSequence: wipingSequence.wipingSteps(),
        padTopRight: { ...selectedPadTopRight(), z },
        feedRate: feedRate * feedRateMultiplierValue(),
        plungeDepth,
        zLift,
      })?.join('\n') || ''
    );
  });

  const isReadyToPrint = () => areStepsCompleteUpTo(StepKeys.Testing);
  const isDisabled = () => !isReadyToPrint() || !testGCode();

  const fileName = createMemo(() => {
    const lastWrite = tracking.lastWipingSequenceWrite();
    if (lastWrite && lastWrite.type === 'preset') {
      return `${lastWrite.preset}-preset-test-${formatPercent(feedRateMultiplierValue())}p.gcode`;
    }
    return `wiper-path-test-${formatPercent(feedRateMultiplierValue())}p.gcode`;
  });

  const handleDownloadGCodeClick = () => {
    const content = testGCode();
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName();
    link.click();
    URL.revokeObjectURL(url);

    track(testGCodeDownloadedEvent(tracking.lastWipingSequenceWrite()));
    track(
      calibrationValuesUsedEvent('testing', selectedPrinter().key, calibration.x(), calibration.y(), calibration.z()),
    );
  };

  return (
    <Section id={steps()[StepKeys.Testing].anchor}>
      <SectionTitle>Testing</SectionTitle>
      <SectionIntro>
        Download a ready-to-run test G-code file that runs your drawn wiping sequence as a complete, standalone test. It
        runs at a reduced speed to give you time to watch safely and stop if anything looks off.
      </SectionIntro>
      <Show when={!isReadyToPrint()}>
        <ErrorMessage
          title="Not ready to test."
          content={
            <>
              Fill out the{' '}
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
              </Link>
              , then draw a wiping path in the{' '}
              <Link
                layout="internal"
                href={`#${steps()[StepKeys.Drawing].anchor}`}
              >
                Drawing section
              </Link>
              .
            </>
          }
        />
      </Show>
      <SectionColumns>
        <SectionColumn>
          <Step>
            <StepTitle>Testing Speed</StepTitle>
            <StepBody>
              <p>Speed at which to test the wiping G-code at (based on feed rate from settings).</p>
              <FormRow>
                <FormSelect
                  label="Speed"
                  value={feedRateMultiplier()}
                  options={[0.05, 0.1, 0.25, 0.5, 0.75, 1].map((feedRate) => ({
                    key: String(feedRate),
                    label: formatPercentString(feedRate),
                  }))}
                  isDisabled={isDisabled()}
                  onChange={(event) => setFeedRateMultiplier(event.currentTarget.value)}
                />
              </FormRow>
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Download Test File</StepTitle>
            <StepBody>
              <Content>
                <Description>
                  <p>
                    <strong>Don't skip this. Run this once to verify your wiping sequence is safe.</strong>
                    <br />
                    This test file is a slowed-down, ready-to-run G-code file to dry-run your wiping sequence without
                    actually printing anything.
                  </p>
                  <p>It does the following:</p>
                  <OrderedList>
                    <li>
                      <strong>Check compatibility</strong> with your printer / firmware
                    </li>
                    <li>
                      <strong>Auto-home</strong>
                    </li>
                    <li>
                      <strong>Move to the parking position</strong> where the nozzle would normally wait for temperature
                    </li>
                    <li>
                      <strong>Run the wiping sequence</strong> that you created
                    </li>
                    <li>
                      <strong>Move to the bed center</strong> (mimics going to the probing area)
                    </li>
                    <li>
                      <strong>Disable motors</strong>
                    </li>
                  </OrderedList>
                  <p>
                    The test file{' '}
                    <strong>
                      runs at {formatPercentString(feedRateMultiplierValue())} of your configured feed rate (
                      {feedRateMultiplierValue() * (settings.feedRate() ?? 0)} mm/min)
                    </strong>
                    . The slower speed gives you time to press the Reset button if you need to stop it and reduces the
                    chance of damage if something collides.
                  </p>
                  <p>
                    It does not heat up the nozzle, so make sure there aren't any dangling filament bits stuck to the
                    nozzle before running the test file.
                  </p>
                  <StrongEmphasis>
                    <strong>This file is for testing only.</strong> Do not paste G-code from this test file into your
                    Start G-code. Copy the G-code from the{' '}
                    <Link
                      layout="internal"
                      href={`#${steps()[StepKeys.Drawing].anchor}`}
                    >
                      Drawing section
                    </Link>{' '}
                    instead.
                  </StrongEmphasis>
                </Description>
                <ButtonWrapper>
                  <Button
                    renderAs="button"
                    layout="primary"
                    label={<>Download "{fileName()}"</>}
                    isDisabled={isDisabled()}
                    onClick={handleDownloadGCodeClick}
                  />
                </ButtonWrapper>
              </Content>
            </StepBody>
          </Step>
          <pre>{testGCode()}</pre>
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
