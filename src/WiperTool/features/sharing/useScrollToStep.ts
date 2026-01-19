import { useSteps } from '@/WiperTool/providers/AppModelProvider';
import type { StepKey } from '@/WiperTool/ui/steps';

export function useScrollToStep() {
  const { steps } = useSteps();

  const scrollToStep = (stepKey: StepKey) => {
    const anchor = steps()[stepKey].anchor;
    const target = document.getElementById(anchor);

    requestAnimationFrame(() => {
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = `#${anchor}`;
      }
    });
  };

  return { scrollToStep };
}
