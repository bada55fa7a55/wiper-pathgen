import type { PadKey, PrinterKey } from 'WiperTool/configuration';
import type { WipingSequence, WipingStep } from 'WiperTool/store';
import { createError } from 'lib/errors';
import { base64UrlDecode, base64UrlEncode } from '../lib/base64';
import { isPadKey, isPrinterKey } from '../lib/validation';

const SHARE_PARAM = 'share';
const SHARE_VERSION = 1;
const SHARE_FILE_PREFIX = 'wiping-sequence';
export const SHARE_FILE_EXTENSION = 'json';

type EncodedWipingStepPoint = ['p', number, number];
type EncodedWipingStepSpeedChange = ['s', number];
type EncodedWipingStep = EncodedWipingStepPoint | EncodedWipingStepSpeedChange;

type EncodeShareOptions = {
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
};

type EncodedSharePayload = {
  v: typeof SHARE_VERSION;
  prt: PrinterKey;
  pad: PadKey;
  seq: EncodedWipingStep[];
};

export type DecodedSharePayload = {
  version: number;
  printerKey: PrinterKey;
  padKey: PadKey;
  wipingSequence: WipingSequence;
};

function secondsOfTheDay() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

function buildSharePayload({ printerKey, padKey, wipingSequence }: EncodeShareOptions): EncodedSharePayload {
  return {
    v: SHARE_VERSION,
    prt: printerKey,
    pad: padKey,
    seq: wipingSequence.map((step) => encodeWipingStep(step)),
  };
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

export function getShareTokenFromUrl(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return params.get(SHARE_PARAM);
}

export function buildShareUrl(token: string): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  params.set(SHARE_PARAM, token);
  url.hash = params.toString();
  return url.toString();
}

export const CURRENT_SHARE_VERSION = SHARE_VERSION;
