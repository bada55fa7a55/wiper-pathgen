import { Show } from 'solid-js';
import { Link, MaterialSymbol } from '@/components';
import { twc } from '@/styles';
import { useSteps } from '@/WiperTool/providers/AppModelProvider';

const Container = twc(
  'div',
  `
  flex
  hidden
  lg:block
  `,
);

const Steps = twc(
  'div',
  `
    flex
    items-center
    gap-3
  `,
);

const Step = twc(
  'div',
  `
    flex
  `,
  {
    variants: {
      isComplete: {
        false: `
          text-shark-200
        `,
        true: `
          text-emerald-400
        `,
      },
    },
  },
);

export function StepOMeter() {
  const { steps } = useSteps();

  const getStepIcon = (stepIndex: number, isComplete: boolean) => {
    if (isComplete) {
      return (
        <MaterialSymbol
          size={16}
          symbol="check_circle"
        />
      );
    }

    return (
      <MaterialSymbol
        size={16}
        symbol={`counter_${stepIndex + 1}`}
      />
    );
  };
  return (
    <Container>
      <Steps>
        {Object.values(steps()).map((step, index) => (
          <>
            <Show when={index !== 0}>
              <Step>
                <MaterialSymbol
                  size={16}
                  symbol="arrow_forward_ios"
                />
              </Step>
            </Show>
            <Step isComplete={step.isComplete}>
              <Link
                layout="lowkey"
                inheritColor
                href={`#${step.anchor}`}
              >
                {getStepIcon(index, step.isComplete)}
                {step.label}
              </Link>
            </Step>
          </>
        ))}
      </Steps>
    </Container>
  );
}
