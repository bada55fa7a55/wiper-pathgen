import { createError } from '@/lib/errors';
import type { PadKey } from '@/WiperTool/domain/pads';
import { isPadKey } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import { isPrinterKey } from '@/WiperTool/domain/printers';
import type { WipingSequence, WipingStep } from '@/WiperTool/domain/wipingSequence';
import { base64UrlDecode } from '@/WiperTool/lib/base64';
import type { EncodedSharePayload } from './common';
import { SHARE_VERSION } from './common';

export type DecodedSharePayload = {
  version: number;
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
};

function decodeWipingStep(step: unknown): WipingStep {
  if (!Array.isArray(step)) {
    throw createError({
      name: 'WipingSequenceDecodeError',
      message: 'Invalid wiping step format: expected array',
      component: 'WSImport',
    });
  }

  if (step[0] === 'p' && step.length === 3) {
    const [, x, y] = step;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw createError({
        name: 'WipingSequenceDecodeError',
        message: 'Invalid wiping step format: point coordinates are not numbers',
        component: 'WSImport',
      });
    }
    return { type: 'point', x, y };
  }

  if (step[0] === 's' && step.length === 2) {
    const [, percentage] = step;
    if (!Number.isFinite(percentage)) {
      throw createError({
        name: 'WipingSequenceDecodeError',
        message: 'Invalid wiping step format: speed percentage is not a number',
        component: 'WSImport',
      });
    }
    return { type: 'speedChange', percentage };
  }

  throw createError({
    name: 'WipingSequenceDecodeError',
    message: 'Invalid wiping step format: unrecognized step type',
    component: 'WSImport',
  });
}

function decodeSharePayload(data: Partial<EncodedSharePayload>): DecodedSharePayload {
  if (
    typeof data !== 'object' ||
    data === null ||
    data.v !== SHARE_VERSION ||
    typeof data.pad !== 'string' ||
    !Array.isArray(data.seq)
  ) {
    throw createError({
      name: 'ShareDecodeError',
      message: 'Invalid share payload structure',
      component: 'WSImport',
    });
  }

  if (!isPrinterKey(data.prt)) {
    throw createError({
      name: 'ShareDecodeError',
      message: 'Invalid printer key in share payload',
      component: 'WSImport',
    });
  }

  if (!isPadKey(data.pad)) {
    throw createError({
      name: 'ShareDecodeError',
      message: 'Invalid pad key in share payload',
      component: 'WSImport',
    });
  }

  const wipingSequence = data.seq.map((rawStep) => decodeWipingStep(rawStep));

  return {
    version: data.v,
    printerKey: data.prt,
    padKey: data.pad,
    wipingSequence,
  };
}

export function decodeShareToken(token: string): DecodedSharePayload {
  try {
    const json = base64UrlDecode(token);
    const data = JSON.parse(json) as Partial<EncodedSharePayload>;
    return decodeSharePayload(data);
  } catch (error) {
    throw createError({
      name: 'ShareDecodeError',
      message: 'Failed to decode share token',
      component: 'WSImport',
      cause: error,
    });
  }
}

export function decodeShareJson(json: string): DecodedSharePayload {
  try {
    const data = JSON.parse(json) as Partial<EncodedSharePayload>;
    return decodeSharePayload(data);
  } catch (error) {
    throw createError({
      name: 'ShareDecodeError',
      message: 'Failed to decode share JSON',
      component: 'WSImport',
      cause: error,
    });
  }
}

export async function decodeShareFile(file: File): Promise<DecodedSharePayload> {
  try {
    const text = await file.text();
    return decodeShareJson(text);
  } catch (error) {
    throw createError({
      name: 'ShareDecodeError',
      message: 'Failed to decode share file',
      component: 'WSImport',
      cause: error,
    });
  }
}
