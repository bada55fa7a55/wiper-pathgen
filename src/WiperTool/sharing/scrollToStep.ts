import type { StepKey } from 'WiperTool/store';
import { steps } from 'WiperTool/store';

export function scrollToStep(stepKey: StepKey) {
  if (typeof window === 'undefined') {
    return;
  }

  const anchor = steps()[stepKey].anchor;
  const target = document.getElementById(anchor);

  window.requestAnimationFrame(() => {
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = `#${anchor}`;
    }
  });
}
