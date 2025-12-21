import { generateTestGCodeCommands } from 'WiperTool/lib/gcode';
import { calibration, isCalibrated, isSettingsComplete, padTopRight, points, printer, settings } from 'WiperTool/store';
import {
  Button,
  ErrorMessage,
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
import { createMemo, Show } from 'solid-js';
import { twc } from 'styles/helpers';
import { testGCodeDownloadedEvent, track } from './lib/analytics';

const ButtonWrapper = twc(
  'div',
  `
  flex
  `,
);

export function TestingSection() {
  const testGCode = createMemo(() => {
    if (
      points().length < 2 ||
      calibration.x === undefined ||
      calibration.y === undefined ||
      calibration.z === undefined ||
      settings.feedRate === undefined ||
      settings.plungeDepth === undefined
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
        points: points(),
        padTopRight: { ...padTopRight(), z: calibration.z },
        feedRate: settings.feedRate * 0.05,
        plungeDepth: settings.plungeDepth,
      })?.join('\n') || ''
    );
  });

  const isReadyToPrint = () => isCalibrated() && isSettingsComplete() && points().length >= 2;
  const isDisabled = () => !isReadyToPrint() || !testGCode();

  const fileName = 'wiper-path-test.gcode';

  const handleDownloadGCodeClick = () => {
    const content = testGCode();
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
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
            <StepTitle>Download Test File</StepTitle>
            <StepBody>
              <p>
                This test G-code recreates the Start G-code portion that handles wiping. It moves the nozzle to the
                parking position, performs the wiping path you drew, and then moves the nozzle to the center of the bed.
                That sequence matches how your printer will enter and exit wiping during a real print.
              </p>
              <p>
                The test file runs at 5% of your configured feed rate ({0.05 * (settings?.feedRate ?? 0)} mm/min). The
                slower speed gives you time to press Reset on the LCD if you need to stop it and reduces the chance of
                damage if something collides.
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
                  layout="primary"
                  disabled={isDisabled()}
                  onClick={handleDownloadGCodeClick}
                >
                  Download {fileName}
                </Button>
              </ButtonWrapper>
            </StepBody>
          </Step>
          {/* <pre>{testGCode()}</pre> */}
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
