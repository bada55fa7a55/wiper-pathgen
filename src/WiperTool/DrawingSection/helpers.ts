import type { Point } from 'WiperTool/store';
import { pad } from 'WiperTool/store';
import { paddings } from 'WiperTool/store/paddings';

export const relToAbs = (relativePoint: Point, padTopRight: Point): Point => ({
  x: padTopRight.x + relativePoint.x,
  y: padTopRight.y + relativePoint.y,
});

export const absToRel = (absolutePoint: Point, padTopRight: Point): Point => ({
  x: absolutePoint.x - padTopRight.x,
  y: absolutePoint.y - padTopRight.y,
});

export const padCutOffWarning = () => {
  if (paddings().top < 0) {
    return 'top';
  }
  if (paddings().bottom < 0) {
    return 'bottom';
  }
  if (paddings().left < 0) {
    return 'left';
  }
  if (paddings().right < 0) {
    return 'right';
  }

  return null;
};

export const isPadInvisible = () => {
  return (
    paddings().top <= pad().height * -1 ||
    paddings().bottom <= pad().height * -1 ||
    paddings().left <= pad().width * -1 ||
    paddings().right <= pad().width * -1
  );
};

export const isPadCutOff = () => !isPadInvisible() && padCutOffWarning() !== null;
