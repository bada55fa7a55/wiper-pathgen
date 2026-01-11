import { calibrationValuesUsedEvent, testGCodeDownloadedEvent, track } from 'WiperTool/lib/analytics';
import { formatPercent, formatPercentString } from 'WiperTool/lib/formatting';
import { generateTestGCodeCommands } from 'WiperTool/lib/gcode';
import {
  areStepsCompleteUpTo,
  calibration,
  getWipingStepPoints,
  lastWipingSequenceWrite,
  padTopRight,
  printer,
  StepKey,
  settings,
  steps,
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

  const isReadyToPrint = () => areStepsCompleteUpTo(StepKey.Testing);
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

    track(testGCodeDownloadedEvent(lastWipingSequenceWrite()));
    track(calibrationValuesUsedEvent('testing', printer().key, calibration.x, calibration.y, calibration.z));
  };

  return (
    <Section id={steps()[StepKey.Testing].anchor}>
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
                href={`#${steps()[StepKey.Calibration].anchor}`}
              >
                Calibration section
              </Link>{' '}
              and{' '}
              <Link
                layout="internal"
                href={`#${steps()[StepKey.Settings].anchor}`}
              >
                Settings section
              </Link>
              , then draw a wiping path in the{' '}
              <Link
                layout="internal"
                href={`#${steps()[StepKey.Drawing].anchor}`}
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
                    This test file is a safe, ready-to-run G-code file to dry-run your wiping sequence. It does the
                    following:
                  </p>
                  <OrderedList>
                    <li>Printer and firmware compatibility check</li>
                    <li>Auto-home</li>
                    <li>Move to the parking position, where the nozzle would normally wait for temperature</li>
                    <li>Perform the wiping sequence you created above</li>
                    <li>Move to the center of the bed to mimic moving to the probing position</li>
                    <li>Turn off motors</li>
                  </OrderedList>
                  <p>
                    The test file runs at {formatPercentString(feedRateMultiplierValue())} of your configured feed rate
                    ({feedRateMultiplierValue() * (settings?.feedRate ?? 0)} mm/min). The slower speed gives you time to
                    press the Reset button if you need to stop it and reduces the chance of damage if something
                    collides.
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
                      href={`#${steps()[StepKey.Drawing].anchor}`}
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
          {/* <pre>{testGCode()}</pre> */}
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
