import type { PadKey } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';

export const SHARE_PARAM = 'share';
export const SHARE_VERSION = 1;
export const SHARE_FILE_PREFIX = 'wiping-sequence';
export const SHARE_FILE_EXTENSION = 'json';

type EncodedWipingStepPoint = ['p', number, number];
type EncodedWipingStepSpeedChange = ['s', number];
type EncodedWipingStep = EncodedWipingStepPoint | EncodedWipingStepSpeedChange;

export type EncodedSharePayload = {
  v: typeof SHARE_VERSION;
  prt: PrinterKey;
  pad: PadKey;
  seq: EncodedWipingStep[];
};
