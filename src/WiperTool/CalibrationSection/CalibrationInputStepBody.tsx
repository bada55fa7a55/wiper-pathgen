import { calibrationValueChangedEvent, track } from 'WiperTool/lib/analytics';
import { formatMicronsToMmString } from 'WiperTool/lib/formatting';
import { FormInput, StepBody } from 'components';
import { createStore } from 'solid-js/store';
import { twc } from 'styles/helpers';
import { mmToUm } from '../lib/conversion';
import { validateSignedDecimal } from '../lib/validation';
import { calibration, setCalibration } from '../store';
import { CalibrationPadPreview } from './CalibrationPadPreview';

const StepBodyContent = twc(
  'div',
  `
  flex
  flex-col
  sm:flex-row
  gap-8
  items-start
  `,
);

const FormContainer = twc(
  'div',
  `
  shrink-0
  grid
  grid-rows-3
  gap-4
  w-64
  `,
);

const CalibrationPadWrapper = twc(
  'div',
  `
  sm:min-w-64
  `,
);

export function CalibrationInputStepBody() {
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
    <StepBody>
      <p>Enter the nozzle position coordinates from the previous step into the form fields below.</p>
      <StepBodyContent>
        <FormContainer>
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
        </FormContainer>
        <CalibrationPadWrapper>
          <CalibrationPadPreview />
        </CalibrationPadWrapper>
      </StepBodyContent>
    </StepBody>
  );
}
