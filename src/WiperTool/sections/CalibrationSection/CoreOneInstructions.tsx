import { MenuBreadcrumb, SectionColumn, SectionColumns, Step, StepBody, StepTitle } from '@/components';
import calibrationNozzlePosition1Asset from './assets/coreone/bb1-p1s-pad-instructions.png';
import { CalibrationInputStepBody } from './CalibrationInputStepBody';
import { Illustration } from './Illustration';

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
              nozzle directly above the <strong>top-right corner</strong> of the silicone pad.
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
        <Illustration
          src={calibrationNozzlePosition1Asset}
          caption="The red dot indicates the pad calibration point"
        />
      </SectionColumn>
    </SectionColumns>
  );
}
