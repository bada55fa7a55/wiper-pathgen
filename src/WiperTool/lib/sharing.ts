import type { PadKey, PrinterKey } from 'WiperTool/configuration';
import type { WipingStep } from 'WiperTool/store';
import { base64UrlDecode, base64UrlEncode } from './base64';
import { isPadKey, isPrinterKey } from './validation';

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
  wipingSequence: WipingStep[];
};

type EncodedSharePayload = {
  v: typeof SHARE_VERSION;
  prt: PrinterKey;
  pad: PadKey;
  seq: EncodedWipingStep[];
};

export type DecodedSharePayload = {
  version: number;
  padKey: PadKey;
  wipingSequence: WipingStep[];
};

function secondsOfTheDay() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
};


function buildSharePayload({ printerKey, padKey, wipingSequence }: EncodeShareOptions): EncodedSharePayload {
  return {
    v: SHARE_VERSION,
    prt: printerKey,
    pad: padKey,
    seq: wipingSequence.map((step) => encodeWipingStep(step)),
  };
}

function encodeWipingStep(step: WipingStep): EncodedWipingStep {
  if (step.type === 'point') {
    return ['p', step.x, step.y];
  }
  return ['s', step.percentage];
}

function decodeWipingStep(step: unknown): WipingStep | null {
  if (!Array.isArray(step)) {
    return null;
  }

  if (step[0] === 'p' && step.length === 3) {
    const [, x, y] = step;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }
    return { type: 'point', x, y };
  }

  if (step[0] === 's' && step.length === 2) {
    const [, percentage] = step;
    if (!Number.isFinite(percentage)) {
      return null;
    }
    return { type: 'speedChange', percentage };
  }

  return null;
}

export function encodeShareToken(encodeShareOptions: EncodeShareOptions): string {
  const payload = buildSharePayload(encodeShareOptions);
  return base64UrlEncode(JSON.stringify(payload));
}

function decodeSharePayload(data: Partial<EncodedSharePayload>): DecodedSharePayload | null {
  if (
    typeof data !== 'object' ||
    data === null ||
    data.v !== SHARE_VERSION ||
    typeof data.pad !== 'string' ||
    !Array.isArray(data.seq)
  ) {
    return null;
  }

  if (!isPrinterKey(data.prt)) {
    return null;
  }

  if (!isPadKey(data.pad)) {
    return null;
  }

  const wipingSequence = data.seq.map((rawStep) => {
    const step = decodeWipingStep(rawStep);
    if (!step) {
      throw new Error('Invalid wiping step');
    }
    return step;
  });

  return {
    version: data.v,
    padKey: data.pad,
    wipingSequence,
  };
}

export function decodeShareToken(token: string): DecodedSharePayload | null {
  try {
    const json = base64UrlDecode(token);
    const data = JSON.parse(json) as Partial<EncodedSharePayload>;
    return decodeSharePayload(data);
  } catch (_error) {
    return null;
  }
}

export function encodeShareJson(encodeShareOptions: EncodeShareOptions): string {
  return JSON.stringify(buildSharePayload(encodeShareOptions), null, 2);
}

export function decodeShareJson(json: string): DecodedSharePayload | null {
  try {
    const data = JSON.parse(json) as Partial<EncodedSharePayload>;
    return decodeSharePayload(data);
  } catch (_error) {
    return null;
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

export async function decodeShareFile(file: File): Promise<DecodedSharePayload | null> {
  try {
    const text = await file.text();
    return decodeShareJson(text);
  } catch (_error) {
    return null;
  }
}

export function getShareTokenFromUrl(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return params.get(SHARE_PARAM);
}

export function buildShareUrl(token: string): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  params.set(SHARE_PARAM, token);
  url.hash = params.toString();
  return url.toString();
}

export const CURRENT_SHARE_VERSION = SHARE_VERSION;
