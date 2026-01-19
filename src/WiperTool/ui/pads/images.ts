import type { PadKey } from '@/WiperTool/domain/pads';
import { PadKeys } from '@/WiperTool/domain/pads';
import bblA1PadSvg from './assets/bbl-a1-pad.svg?url';

export const padImages: Record<PadKey, string> = {
  [PadKeys.BambuLabA1]: bblA1PadSvg,
};
