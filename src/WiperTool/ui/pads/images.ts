import bblA1PadSvg from '@/WiperTool/assets/bbl-a1-pad.svg';
import type { PadKey } from '@/WiperTool/domain/pads';
import { PadKeys } from '@/WiperTool/domain/pads';

export const padImages: Record<PadKey, string> = {
  [PadKeys.BambuLabA1]: bblA1PadSvg,
};
