import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { generateWipingSequenceGCode, serializeGCode } from '../src/WiperTool/domain/gcode';
import { computePadTopRight, padProperties } from '../src/WiperTool/domain/pads';
import { generatePresetSequence } from '../src/WiperTool/domain/presets';
import { printerProperties } from '../src/WiperTool/domain/printers';

const fixedDate = new Date('2025-01-02T03:04:05Z');
const RealDate = Date;
class FixedDate extends RealDate {
  constructor();
  constructor(value: string | number | Date);
  constructor(...args: [] | [string | number | Date]) {
    if (args.length === 0) {
      super(fixedDate.getTime());
      return;
    }
    super(...args);
  }

  static now() {
    return fixedDate.getTime();
  }
}

global.Date = FixedDate as unknown as DateConstructor;

const printer = printerProperties['prusa-core-one'];
const pad = padProperties['bbl-a1'];
const wipingSequence = generatePresetSequence('ultimate', pad);
const calibration = { x: 77500, y: -11000, z: 2000 };
const padTopRight = { ...computePadTopRight(pad, calibration), z: calibration.z };

const gcode = generateWipingSequenceGCode({
  printerName: printer.name,
  printerOriginalCleaningGcode: printer.originalCleaningGCode,
  padRef: calibration,
  wipingSequence,
  padTopRight,
  feedRate: 5000,
  plungeDepth: 500,
  zLift: 4000,
});

if (!gcode) {
  throw new Error('Expected gcode to be generated.');
}

const content = `${serializeGCode(gcode).join('\n')}\n`;
const fixturePath = join('src', 'WiperTool', 'domain', 'gcode', '__fixtures__', 'prusa-core-one-ultimate.gcode');

await mkdir(dirname(fixturePath), { recursive: true });
await writeFile(fixturePath, content, 'utf8');
