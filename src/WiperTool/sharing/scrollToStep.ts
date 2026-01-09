import type { StepKey } from 'WiperTool/store';
import { steps } from 'WiperTool/store';
import { invariant } from 'lib/invariant';

export function scrollToStep(stepKey: StepKey) {
  invariant(window);

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
