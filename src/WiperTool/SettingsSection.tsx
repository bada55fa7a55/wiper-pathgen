import { settingsValueChangedEvent, track } from 'WiperTool/lib/analytics';
import { formatMicronsToMmString } from 'WiperTool/lib/formatting';
import {
  ErrorMessage,
  FormInput,
  FormSelect,
  InlineCode,
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
import { createStore } from 'solid-js/store';
import { twc } from 'styles/helpers';
import { padProperties, printerProperties } from './configuration';
import { mmToUm } from './lib/conversion';
import { validatePositiveDecimal, validatePositiveInteger } from './lib/validation';
import { isCalibrated, setSettings, settings } from './store';

const FormRow = twc(
  'div',
  `
  grid
  grid-rows-1
  md:grid-cols-3
  gap-4
  `,
);

export function SettingsSection() {
  const isDisabled = createMemo(() => !isCalibrated());

  const [formValues, setFormValues] = createStore({
    plungeDepth: formatMicronsToMmString(settings.plungeDepth),
    feedRate: settings.feedRate?.toString() ?? '',
    zLift: formatMicronsToMmString(settings.zLift),
    padType: settings.padType?.toString() ?? '',
    printer: settings.printer?.toString() ?? '',
  });
  const [lastTrackedValues, setLastTrackedValues] = createStore({
    plungeDepth: formatMicronsToMmString(settings.plungeDepth),
    feedRate: settings.feedRate?.toString() ?? '',
    zLift: formatMicronsToMmString(settings.zLift),
  });

  type FormValueKey = keyof typeof formValues;

  const [errors, setErrors] = createStore({
    plungeDepth: '',
    feedRate: '',
    zLift: '',
    padType: '',
    printer: '',
  });

  type ValidationResult = ReturnType<typeof validatePositiveDecimal>;
  type ValidatorFn = (rawValue: string) => ValidationResult;

  const validators: Record<FormValueKey, ValidatorFn | null> = {
    plungeDepth: validatePositiveDecimal,
    zLift: validatePositiveDecimal,
    feedRate: validatePositiveInteger,
    padType: null,
    printer: null,
  };

  type FormEvent = Event & { currentTarget: HTMLInputElement | HTMLSelectElement; target: Element };

  const handleSettingInput = (formValueKey: FormValueKey) => (event: FormEvent) => {
    const rawValue = event.currentTarget.value.trim();

    setFormValues(formValueKey, rawValue);

    if (validators[formValueKey]) {
      const { parsedValue, errorMessage } = validators[formValueKey](rawValue);

      switch (formValueKey) {
        case 'plungeDepth': {
          const micronValue = parsedValue === undefined ? undefined : mmToUm(parsedValue);
          setSettings(formValueKey, micronValue);
          break;
        }
        case 'zLift': {
          const micronValue = parsedValue === undefined ? undefined : mmToUm(parsedValue);
          setSettings(formValueKey, micronValue);
          break;
        }
        default:
          setSettings(formValueKey, parsedValue);
      }
      setErrors(formValueKey, errorMessage);
      return;
    }

    setSettings(formValueKey, rawValue);
  };

  const handleSettingBlur =
    (formValueKey: 'plungeDepth' | 'feedRate' | 'zLift') =>
    (event: FocusEvent & { currentTarget: HTMLInputElement }) => {
      const rawValue = event.currentTarget.value.trim();
      const previousValue = lastTrackedValues[formValueKey];

      if (rawValue !== previousValue) {
        track(settingsValueChangedEvent(formValueKey));
        setLastTrackedValues(formValueKey, rawValue);
      }
    };

  const handleSettingSelect = (formValueKey: 'printer' | 'padType') => (event: FormEvent) => {
    handleSettingInput(formValueKey)(event);
    track(settingsValueChangedEvent(formValueKey));
  };

  return (
    <Section id="settings">
      <SectionTitle>Settings</SectionTitle>
      <SectionColumns>
        <SectionColumn>
          <Show when={isDisabled()}>
            <ErrorMessage
              title="Calibration incomplete."
              content={
                <>
                  Fill out the{' '}
                  <Link
                    layout="internal"
                    href="#calibration"
                  >
                    calibration section
                  </Link>{' '}
                  before continuing.
                </>
              }
            />
          </Show>
          <SectionIntro>
            <p>
              Configure the values used to generate the wiping sequence G-code. Defaults are provided and usually do not
              need to be changed.
            </p>
          </SectionIntro>
          <Step>
            <StepTitle>Hardware Setup</StepTitle>
            <StepBody>
              <p>Choose your printer and silicone pad to load the correct pad dimensions and printer motion limits.</p>
              <FormRow>
                <FormSelect
                  label="3D printer"
                  value={formValues.printer}
                  options={Object.keys(printerProperties).map((padKey) => ({
                    key: padKey,
                    label: printerProperties[padKey].name,
                  }))}
                  error={errors.printer ? { type: 'error', message: errors.printer } : undefined}
                  isDisabled={isDisabled()}
                  onChange={handleSettingSelect('printer')}
                />
                <FormSelect
                  label="Silicone pad type"
                  value={formValues.padType}
                  options={Object.keys(padProperties).map((padKey) => ({
                    key: padKey,
                    label: padProperties[padKey].name,
                  }))}
                  error={errors.padType ? { type: 'error', message: errors.padType } : undefined}
                  isDisabled={isDisabled()}
                  onChange={handleSettingSelect('padType')}
                />
              </FormRow>
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Plunge Depth</StepTitle>
            <StepBody>
              <p>How far the nozzle lowers into the silicone pad during the wiping sequence.</p>
              <FormInput
                label="Nozzle plunge depth (mm)"
                value={formValues.plungeDepth}
                error={errors.plungeDepth ? { type: 'error', message: errors.plungeDepth } : undefined}
                isDisabled={isDisabled()}
                onInput={handleSettingInput('plungeDepth')}
                onBlur={handleSettingBlur('plungeDepth')}
              />
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Wiping Speed</StepTitle>
            <StepBody>
              <p>Feed rate for the wiping sequence (mm/min).</p>
              <FormInput
                label="Feed rate (mm/min)"
                value={formValues.feedRate}
                error={errors.feedRate ? { type: 'error', message: errors.feedRate } : undefined}
                isDisabled={isDisabled()}
                onInput={handleSettingInput('feedRate')}
                onBlur={handleSettingBlur('feedRate')}
              />
            </StepBody>
          </Step>
          <Step>
            <StepTitle>Z-Lift</StepTitle>
            <StepBody>
              <p>
                Lift the Z-axis after wiping before leaving the pad area. Enter <InlineCode>0</InlineCode> to disable.
              </p>
              <FormInput
                label="Z-lift (mm)"
                value={formValues.zLift}
                error={errors.zLift ? { type: 'error', message: errors.zLift } : undefined}
                isDisabled={isDisabled()}
                onInput={handleSettingInput('zLift')}
                onBlur={handleSettingBlur('zLift')}
              />
            </StepBody>
          </Step>
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
