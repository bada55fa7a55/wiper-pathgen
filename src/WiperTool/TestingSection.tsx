import { testGCodeDownloadedEvent, track } from 'WiperTool/lib/analytics';
import { formatPercent, formatPercentString } from 'WiperTool/lib/formatting';
import { generateTestGCodeCommands } from 'WiperTool/lib/gcode';
import {
  calibration,
  getWipingStepPoints,
  isCalibrated,
  isSettingsComplete,
  padTopRight,
  printer,
  settings,
  wipingSequence,
} from 'WiperTool/store';
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

export function TestingSection() {
  const [feedRateMultiplier, setFeedRateMultiplier] = createSignal<string>('0.05');
  const feedRateMultiplierValue = createMemo(() => Number(feedRateMultiplier()));
  const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence()));

  const testGCode = createMemo(() => {
    if (
      sequencePoints().length < 2 ||
      calibration.x === undefined ||
      calibration.y === undefined ||
      calibration.z === undefined ||
      settings.feedRate === undefined ||
      settings.plungeDepth === undefined ||
      settings.zLift === undefined
    ) {
      return null;
    }
    return (
      generateTestGCodeCommands({
        printerName: printer().name,
        printerOriginalCleaningGcode: printer().originalCleaningGCode,
        printerId: printer().printerId,
        printerMaxCoords: {
          x: printer().maxX,
          y: printer().maxY,
        },
        printerParkingCoords: {
          x: printer().parkingCoords.x,
          y: printer().parkingCoords.y,
          z: printer().parkingZHeight,
        },
        padRef: {
          x: calibration.x,
          y: calibration.y,
          z: calibration.z,
        },
        wipingSequence: wipingSequence(),
        padTopRight: { ...padTopRight(), z: calibration.z },
        feedRate: settings.feedRate * feedRateMultiplierValue(),
        plungeDepth: settings.plungeDepth,
        zLift: settings.zLift,
      })?.join('\n') || ''
    );
  });

  const isReadyToPrint = () => isCalibrated() && isSettingsComplete() && sequencePoints().length >= 2;
  const isDisabled = () => !isReadyToPrint() || !testGCode();

  const fileName = createMemo(() => `wiper-path-test-${formatPercent(feedRateMultiplierValue())}p.gcode`);

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

    track(testGCodeDownloadedEvent());
  };

  return (
    <Section id="testing">
      <SectionTitle>Testing</SectionTitle>
      <SectionIntro>
        Download a test G-code file that mirrors the wiping portion of your Start G-code. It runs the sequence at a
        slower speed so you can watch safely and stop if something looks off.
      </SectionIntro>
      <Show when={!isReadyToPrint()}>
        <ErrorMessage
          title="Error: Not ready to test."
          content={
            <>
              Fill out the{' '}
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
              </Link>
              , then draw a wiping path in the{' '}
              <Link
                layout="internal"
                href="#drawing"
              >
                drawing section
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
              <p>
                This test G-code recreates the Start G-code portion that handles wiping. It moves the nozzle to the
                parking position, performs the wiping path you drew, and then moves the nozzle to the center of the bed.
                That sequence matches how your printer will enter and exit wiping during a real print.
              </p>
              <p>
                The test file runs at {formatPercentString(feedRateMultiplierValue())} of your configured feed rate (
                {feedRateMultiplierValue() * (settings?.feedRate ?? 0)} mm/min). The slower speed gives you time to
                press Reset on the LCD if you need to stop it and reduces the chance of damage if something collides.
                <br />
                It does not heat up the nozzle, so make sure there aren't any dangling filament bits stuck to the nozzle
                before running the test file.
              </p>
              <p>
                Do not paste G-code from this test file into your Start G-code. Copy the G-code from the{' '}
                <Link
                  layout="internal"
                  href="#drawing"
                >
                  drawing section
                </Link>{' '}
                instead.
              </p>
              <ButtonWrapper>
                <Button
                  renderAs="button"
                  layout="primary"
                  label={<>Download {fileName()}</>}
                  isDisabled={isDisabled()}
                  onClick={handleDownloadGCodeClick}
                />
              </ButtonWrapper>
            </StepBody>
          </Step>
          {/* <pre>{testGCode()}</pre> */}
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
