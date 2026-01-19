import { createError } from '@/lib/errors';
import type { PadKey } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import type { WipingSequence, WipingStep } from '@/WiperTool/domain/wipingSequence';
import { base64UrlEncode } from '@/WiperTool/lib/base64';
import type { EncodedSharePayload } from './common';
import { SHARE_FILE_EXTENSION, SHARE_FILE_PREFIX, SHARE_VERSION } from './common';

type EncodedWipingStepPoint = ['p', number, number];
type EncodedWipingStepSpeedChange = ['s', number];
type EncodedWipingStep = EncodedWipingStepPoint | EncodedWipingStepSpeedChange;

type EncodeShareOptions = {
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
};

function secondsOfTheDay() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

function encodeWipingStep(step: WipingStep): EncodedWipingStep {
  switch (step.type) {
    case 'point':
      if (!Number.isFinite(step.x) || !Number.isFinite(step.y)) {
        throw createError({
          name: 'WipingSequenceEncodeError',
          message: 'Invalid wiping step: point coordinates are not numbers',
          component: 'WSExport',
        });
      }
      return ['p', step.x, step.y];
    case 'speedChange':
      if (!Number.isFinite(step.percentage)) {
        throw createError({
          name: 'WipingSequenceEncodeError',
          message: 'Invalid wiping step: speed percentage is not a number',
          component: 'WSExport',
        });
      }
      return ['s', step.percentage];
    default:
      return unreachable(step);
  }
}

function buildSharePayload({ printerKey, padKey, wipingSequence }: EncodeShareOptions): EncodedSharePayload {
  return {
    v: SHARE_VERSION,
    prt: printerKey,
    pad: padKey,
    seq: wipingSequence.map((step) => encodeWipingStep(step)),
  };
}

export function encodeShareJson(encodeShareOptions: EncodeShareOptions): string {
  try {
    return JSON.stringify(buildSharePayload(encodeShareOptions), null, 2);
  } catch (error) {
    throw createError({
      name: 'ShareEncodeError',
      message: 'Failed to encode share JSON',
      component: 'WSExport',
      cause: error,
    });
  }
}

export function encodeShareToken(encodeShareOptions: EncodeShareOptions): string {
  try {
    const payload = buildSharePayload(encodeShareOptions);
    return base64UrlEncode(JSON.stringify(payload));
  } catch (error) {
    throw createError({
      name: 'ShareEncodeError',
      message: 'Failed to encode share token',
      component: 'WSExport',
      cause: error,
    });
  }
}

export function buildShareFileName(): string {
  const datestamp = new Date().toISOString().split('T')[0];
  const timeComponent = secondsOfTheDay();
  return `${SHARE_FILE_PREFIX}-${datestamp}-${timeComponent}.${SHARE_FILE_EXTENSION}`;
}

export function createShareFile(encodeShareOptions: EncodeShareOptions): { fileName: string; blob: Blob } {
  const json = encodeShareJson(encodeShareOptions);
  return {
    fileName: buildShareFileName(),
    blob: new Blob([json], { type: 'application/json' }),
  };
}
