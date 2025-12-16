import { calibration, pad, padTopRight, printer } from 'WiperTool/store';
import { createMemo } from 'solid-js';

export const paddings = createMemo(() => {
  if (calibration.x === undefined || calibration.y === undefined) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }
  const maxPadding = 10000;
  const top = printer().maxY - padTopRight().y;
  const bottom = padTopRight().y - pad().height - printer().minY;

  const left = padTopRight().x - pad().width - printer().minX;
  const right = printer().maxX - padTopRight().x;

  return {
    top: Math.min(top, maxPadding),
    bottom: Math.min(bottom, maxPadding),
    left: Math.min(left, maxPadding),
    right: Math.min(right, maxPadding),
  };
});
