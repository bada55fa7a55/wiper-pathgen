import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { computePadTopRight, padProperties } from '@/WiperTool/domain/pads';
import { generatePresetSequence } from '@/WiperTool/domain/presets';
import { printerProperties } from '@/WiperTool/domain/printers';
import { getWipingStepPoints, makeWipingStepPoint } from '@/WiperTool/domain/wipingSequence';
import { umToMm } from '@/WiperTool/lib/conversion';
import { generateTestGCode, generateWipingSequenceGCode } from './model';
import { serializeGCode } from './serialization';

describe('gcode generation', () => {
  it('returns null when there are fewer than two points', () => {
    const gcode = generateWipingSequenceGCode({
      printerName: 'Test Printer',
      printerOriginalCleaningGcode: 'G29 P9 X208 Y-2.5 W32 H4',
      padRef: { x: 0, y: 0, z: 0 },
      wipingSequence: [makeWipingStepPoint({ x: 0, y: 0 })],
      padTopRight: { x: 0, y: 0, z: 0 },
      feedRate: 4000,
      plungeDepth: 1000,
      zLift: 1000,
    });

    expect(gcode).toBeNull();
  });

  it('generates wiping sequence moves with header and footer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-02T03:04:05Z'));

    const gcode = generateWipingSequenceGCode({
      printerName: 'Test Printer',
      printerOriginalCleaningGcode: 'G29 P9 X208 Y-2.5 W32 H4',
      padRef: { x: 10000, y: 20000, z: 30000 },
      wipingSequence: [makeWipingStepPoint({ x: 0, y: 0 }), makeWipingStepPoint({ x: 1000, y: -2000 })],
      padTopRight: { x: 10000, y: 20000, z: 30000 },
      feedRate: 5000,
      plungeDepth: 1000,
      zLift: 2000,
    });

    vi.useRealTimers();

    expect(gcode).not.toBeNull();
    const lines = serializeGCode(gcode ?? []);

    expect(lines[0]).toBe('; G29 P9 X208 Y-2.5 W32 H4 ; <- stock nozzle cleaning');
    expect(lines[1]).toBe('; Start Test Printer nozzle wiping sequence');
    expect(lines[2]).toBe('; REF: X10.00 Y20.00 Z30.00');
    expect(lines[3]).toBe('; GEN: 2025-01-02 03:04:05 UTC');
    expect(lines).toContain('G0 X10.000 Y20.000 Z29.00 F5000');
    expect(lines).toContain('G0 X11.000 Y18.000 Z29.00 F5000');
    expect(lines).toContain('G0 Z31.00 F5000 ; z-lift');
    expect(lines[lines.length - 1]).toBe('; End nozzle wiping sequence');
  });

  it('generates test gcode with setup and teardown moves', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-02T03:04:05Z'));

    const gcode = generateTestGCode({
      printerName: 'Test Printer',
      printerId: 'TESTPRINTER',
      printerOriginalCleaningGcode: 'G29 P9 X208 Y-2.5 W32 H4',
      printerParkingCoords: { x: 1000, y: 2000, z: 3000 },
      printerMaxCoords: { x: 200000, y: 180000 },
      padRef: { x: 10000, y: 20000, z: 30000 },
      wipingSequence: [makeWipingStepPoint({ x: 0, y: 0 }), makeWipingStepPoint({ x: 1000, y: 0 })],
      padTopRight: { x: 10000, y: 20000, z: 30000 },
      feedRate: 5000,
      plungeDepth: 1000,
      zLift: 0,
    });

    vi.useRealTimers();

    expect(gcode).not.toBeNull();
    const lines = serializeGCode(gcode ?? []);

    expect(lines[0]).toBe('; NOZZLE WIPER G-CODE TEST');
    expect(lines).toContain('M17 ; enable steppers');
    expect(lines).toContain('M862.3 P "TESTPRINTER" ; printer model check');
    expect(lines).toContain('M862.6 P"Input shaper" ; FW feature check');
    expect(lines).toContain('G90 ; use absolute positioning');
    expect(lines).toContain('G28 ; home all without mesh bed level');
    expect(lines).toContain('G0 Z3.00 F10000 ; parking position z');
    expect(lines).toContain('G0 X1.000 Y2.000 F4800 ; parking position x and y');
    expect(lines).toContain('G0 X100.000 Y90.000 F4800 ; move to center');
    expect(lines[lines.length - 1]).toBe('M84 X Y E ; disable motors');
  });

  it('generates gcode for the ultimate preset using printerProperties', () => {
    const printer = printerProperties['prusa-core-one'];
    const pad = padProperties['bbl-a1'];
    const wipingSequence = generatePresetSequence('ultimate', pad);
    const points = getWipingStepPoints(wipingSequence);
    const padTopRight = { x: 120000, y: 80000, z: 30000 };
    const firstPoint = points[0];

    const gcode = generateWipingSequenceGCode({
      printerName: printer.name,
      printerOriginalCleaningGcode: printer.originalCleaningGCode,
      padRef: { x: 120000, y: 80000, z: 30000 },
      wipingSequence,
      padTopRight,
      feedRate: 5000,
      plungeDepth: 1000,
      zLift: 0,
    });

    expect(gcode).not.toBeNull();
    const lines = serializeGCode(gcode ?? []);

    const formatXY = (value: number) => {
      const rounded = Math.round(umToMm(value) * 1000) / 1000;
      return rounded.toFixed(3);
    };
    const formatZ = (value: number) => {
      const rounded = Math.round(umToMm(value) * 100) / 100;
      return rounded.toFixed(2);
    };

    const expectedX = formatXY(padTopRight.x + firstPoint.x);
    const expectedY = formatXY(padTopRight.y + firstPoint.y);
    const expectedZ = formatZ(padTopRight.z - 1000);
    const expectedMove = `G0 X${expectedX} Y${expectedY} Z${expectedZ} F5000`;

    expect(lines).toContain(expectedMove);
  });

  it('matches the golden gcode fixture for the ultimate preset', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-02T03:04:05Z'));

    const printer = printerProperties['prusa-core-one'];
    const pad = padProperties['bbl-a1'];
    const calibration = { x: 77500, y: -11000, z: 2000 };
    const padTopRight = { ...computePadTopRight(pad, calibration), z: calibration.z };
    const wipingSequence = generatePresetSequence('ultimate', pad);

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

    vi.useRealTimers();

    expect(gcode).not.toBeNull();
    const serialized = `${serializeGCode(gcode ?? []).join('\n')}\n`;
    const fixturePath = fileURLToPath(new URL('./__fixtures__/prusa-core-one-ultimate.gcode', import.meta.url));
    const fixture = readFileSync(fixturePath, 'utf8');

    expect(serialized).toBe(fixture);
  });
});
