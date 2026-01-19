import type { PadKey } from '@/WiperTool/domain/pads';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import type { WipingSequence } from '@/WiperTool/domain/wipingSequence';

export const FailureTypes = {
  Decode: 'decode',
  UnsupportedFileType: 'unsupported-file-type',
} as const;

export type FailureType = (typeof FailureTypes)[keyof typeof FailureTypes];

export type WipingSequenceImport =
  | {
      status: 'idle';
    }
  | {
      status: 'imported';
      wipingSequence: WipingSequence;
      printerKey: PrinterKey;
      padKey: PadKey;
    }
  | {
      status: 'failure';
      failure: FailureType;
    };

function isJsonFile(file: File) {
  return file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
}

export function isImportableWipingSequenceFile(file: File) {
  return isJsonFile(file);
}
