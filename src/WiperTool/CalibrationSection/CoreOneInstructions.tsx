import { MenuBreadcrumb, SectionColumn, SectionColumns, Step, StepBody, StepTitle } from 'components';
import { twc } from 'styles/helpers';
import calibrationNozzlePosition1Asset from './assets/coreone/calibration-nozzle-position-1.png';
import calibrationNozzlePosition2Asset from './assets/coreone/calibration-nozzle-position-2.png';
import { CalibrationInputStepBody } from './CalibrationInputStepBody';

const Illustration = twc(
  'div',
  `
  basis-03
  flex
  flex-col
  gap-2
  `,
);

const IllustrationImage = twc('img', '');

const IllustrationCaption = twc(
  'div',
  `
  text-xs
  text-center
  text-gray-400
  `,
);

export function CoreOneInstructions() {
  return (
    <SectionColumns>
      <SectionColumn>
        <Step>
          <StepTitle>Step 1: Homing</StepTitle>
          <StepBody>
            <p>
              After installing the wiper arm and silicone pad according to the documentation on Printables, home the
              printer via <MenuBreadcrumb path={['LCD Menu', 'Control', 'Auto Home']} /> on the LCD.
            </p>
          </StepBody>
        </Step>
        <Step>
          <StepTitle>Step 2: Calibrate Silicone Pad Position</StepTitle>
          <StepBody>
            <p>
              Via <MenuBreadcrumb path={['LCD Menu', 'Control', 'Move Axis', 'Move X / Move Y / Move Z']} />, move the
              nozzle directly above the <strong>center of the top-right square</strong> of the silicone pad. This
              applies to both right- and left-sided versions of the nozzle wiper arm.
            </p>
            <p>Set the Z-axis height so that the nozzle just barely touches the silicone pad.</p>
            <p>
              The LCD only moves in 1mm increments, so a close approximation is fine. Eyeball the decimal points if your
              calibration point falls between millimeters.
            </p>
            <p>Note the X, Y, and Z nozzle position coordinates shown on the LCD for the next step.</p>
          </StepBody>
        </Step>
        <Step>
          <StepTitle>Step 3: Enter Nozzle Coordinates</StepTitle>
          <CalibrationInputStepBody />
        </Step>
      </SectionColumn>
      <SectionColumn>
        <Illustration>
          <IllustrationImage
            src={calibrationNozzlePosition1Asset}
            alt=""
          />
          <IllustrationCaption>Nozzle position illustration</IllustrationCaption>
        </Illustration>
        <Illustration>
          <IllustrationImage
            src={calibrationNozzlePosition2Asset}
            alt=""
          />
          <IllustrationCaption>The red dot indicates the pad calibration point</IllustrationCaption>
        </Illustration>
      </SectionColumn>
    </SectionColumns>
  );
}
