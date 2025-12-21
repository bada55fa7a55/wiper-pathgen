import { calibrationValueChangedEvent, track } from 'WiperTool/lib/analytics';
import { formatMicronsToMmString } from 'WiperTool/lib/formatting';
import {
  FormInput,
  MenuBreadcrumb,
  Section,
  SectionColumn,
  SectionColumns,
  SectionIntro,
  SectionTitle,
  Step,
  StepBody,
  StepTitle,
} from 'components';
import { createStore } from 'solid-js/store';
import { twc } from 'styles/helpers';
import { mmToUm } from '../lib/conversion';
import { validateSignedDecimal } from '../lib/validation';
import { calibration, setCalibration } from '../store';
import calibrationNozzlePosition1Asset from './assets/calibration-nozzle-position-1.png';
import calibrationNozzlePosition2Asset from './assets/calibration-nozzle-position-2.png';

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

const FormRow = twc(
  'div',
  `
  grid
  grid-rows-1
  md:grid-cols-3
  gap-4
  `,
);

export function ClaibrationSection() {
  const [formValues, setFormValues] = createStore({
    x: formatMicronsToMmString(calibration.x),
    y: formatMicronsToMmString(calibration.y),
    z: formatMicronsToMmString(calibration.z),
  });
  const [lastTrackedValues, setLastTrackedValues] = createStore({
    x: formatMicronsToMmString(calibration.x),
    y: formatMicronsToMmString(calibration.y),
    z: formatMicronsToMmString(calibration.z),
  });

  type FormValueKey = keyof typeof formValues;

  const [errors, setErrors] = createStore({
    x: '',
    y: '',
    z: '',
  });

  const validators: Record<FormValueKey, typeof validateSignedDecimal> = {
    x: validateSignedDecimal,
    y: validateSignedDecimal,
    z: validateSignedDecimal,
  };

  const handleCalibrationInput =
    (formValueKey: FormValueKey) => (event: InputEvent & { currentTarget: HTMLInputElement; target: Element }) => {
      const rawValue = event.currentTarget.value.trim();

      setFormValues(formValueKey, rawValue);

      const { parsedValue, errorMessage } = validators[formValueKey](rawValue);
      const micronValue = parsedValue === undefined ? undefined : mmToUm(parsedValue);
      setCalibration(formValueKey, micronValue);
      setErrors(formValueKey, errorMessage);
    };

  const handleCalibrationBlur =
    (formValueKey: FormValueKey) => (event: FocusEvent & { currentTarget: HTMLInputElement; target: Element }) => {
      const rawValue = event.currentTarget.value.trim();
      const previousValue = lastTrackedValues[formValueKey];

      if (rawValue !== previousValue) {
        track(calibrationValueChangedEvent(formValueKey));
        setLastTrackedValues(formValueKey, rawValue);
      }
    };

  return (
    <Section id="calibration">
      <SectionTitle>Silicone Pad Position Calibration</SectionTitle>
      <SectionColumns>
        <SectionColumn>
          <SectionIntro>
            <p>
              Use this section to record the silicone pad position so the tool can calculate the wiping coordinates
              accurately.
            </p>
          </SectionIntro>
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
                The LCD only moves in 1mm increments, so a close approximation is fine. Eyeball the decimal points if
                your calibration point falls between millimeters.
              </p>
              <p>Note the X, Y, and Z nozzle position coordinates shown on the LCD for the next step.</p>
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Step 3: Enter Nozzle Coordinates</StepTitle>
            <StepBody>
              <p>Enter the nozzle position coordinates from the previous step into the form fields below.</p>
              <FormRow>
                <FormInput
                  label="Nozzle position X (mm)"
                  value={formValues.x}
                  error={errors.x ? { type: 'error', message: errors.x } : undefined}
                  onInput={handleCalibrationInput('x')}
                  onBlur={handleCalibrationBlur('x')}
                />
                <FormInput
                  label="Nozzle position Y (mm)"
                  value={formValues.y}
                  error={errors.y ? { type: 'error', message: errors.y } : undefined}
                  onInput={handleCalibrationInput('y')}
                  onBlur={handleCalibrationBlur('y')}
                />
                <FormInput
                  label="Nozzle position Z (mm)"
                  value={formValues.z}
                  error={errors.z ? { type: 'error', message: errors.z } : undefined}
                  onInput={handleCalibrationInput('z')}
                  onBlur={handleCalibrationBlur('z')}
                />
              </FormRow>
            </StepBody>
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
    </Section>
  );
}
