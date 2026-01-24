import type { PadKey } from '@/WiperTool/domain/pads';
import { PadKeys } from '@/WiperTool/domain/pads';
import bblP1SPadSvg from './assets/bbl-p1s-pad.svg?url';

export const padImages: Record<PadKey, string> = {
  [PadKeys.BambuLabP1S]: bblP1SPadSvg,
};
