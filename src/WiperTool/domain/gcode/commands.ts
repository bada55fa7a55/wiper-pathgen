import { umToMm } from '@/WiperTool/lib/conversion';
import type { Point3D } from '@/WiperTool/lib/geometry';

type LiteralString<S extends string> = string extends S ? never : S;

type AtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

type ParamMode = 'kv' | 'flag';
type KVParams<K extends string> = Partial<Record<K, string>>;
type FlagParams<K extends string> = Partial<Record<K, true>>;

type ParamsOf<Keys extends string, Mode extends ParamMode> = Mode extends 'kv' ? KVParams<Keys> : FlagParams<Keys>;

type ParamsField<Keys extends string, Mode extends ParamMode, RequireAtLeastOne extends boolean> = [Keys] extends [
  never,
]
  ? { params?: never }
  : RequireAtLeastOne extends true
    ? { params: AtLeastOne<ParamsOf<Keys, Mode>> }
    : { params?: ParamsOf<Keys, Mode> };

export type AbstractCommand<
  Op extends string,
  Keys extends string = never,
  Mode extends ParamMode = 'kv',
  RequireAtLeastOne extends boolean = false,
> = {
  type: 'cmd';
  op: LiteralString<Op>;
  comment?: string;
} & ParamsField<Keys, Mode, RequireAtLeastOne>;

export type GCodeComment = { type: 'comment'; text: string };
export type GCodeBlankLine = { type: 'blank' };

type MoveParams = 'X' | 'Y' | 'Z' | 'E' | 'F';

export type G0Command = AbstractCommand<'G0', MoveParams, 'kv', true>;
export type G1Command = AbstractCommand<'G1', MoveParams, 'kv', true>;
export type M17Command = AbstractCommand<'M17'>;
export type M84Command = AbstractCommand<'M84', 'X' | 'Y' | 'E', 'flag', false>;
export type G90Command = AbstractCommand<'G90'>;
export type G28Command = AbstractCommand<'G28'>;
export type M862_3Command = AbstractCommand<'M862.3', 'P', 'kv', true>;
export type M862_6Command = AbstractCommand<'M862.6', 'P', 'kv', true>;

export type GCodeCommand =
  | GCodeComment
  | GCodeBlankLine
  | G0Command
  | G1Command
  | M17Command
  | M84Command
  | G90Command
  | G28Command
  | M862_3Command
  | M862_6Command;

export type GCodeProgram = GCodeCommand[];

function formatAxisXY(value: number) {
  const rounded = Math.round(value * 1000) / 1000;
  return rounded.toFixed(3);
}

function formatAxisZ(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toFixed(2);
}

function formatAxisE(value: number) {
  const rounded = Math.round(value * 100000) / 100000;
  return rounded.toFixed(5);
}

function quoted(value: string): string {
  return `"${value}"`;
}

type LinearMoveCoords = AtLeastOne<Partial<Point3D & { e: number }>>;

export const gCodeCommands = {
  comment(text: string): GCodeComment {
    return { type: 'comment', text };
  },

  linearMove(coords: LinearMoveCoords, feedRate?: number, comment?: string): G0Command | G1Command {
    const params: Partial<Record<MoveParams, string>> = {
      ...(coords.x !== undefined ? { X: formatAxisXY(umToMm(coords.x)) } : {}),
      ...(coords.y !== undefined ? { Y: formatAxisXY(umToMm(coords.y)) } : {}),
      ...(coords.z !== undefined ? { Z: formatAxisZ(umToMm(coords.z)) } : {}),
      // Note: Extrusion is in millimeter, not microns
      ...(coords.e !== undefined ? { E: formatAxisE(coords.e) } : {}),
      ...(feedRate !== undefined ? { F: String(feedRate) } : {}),
    };

    if (Object.keys(params).length === 0) {
      throw new Error('Invalid params');
    }

    if (params.E !== undefined) {
      return { type: 'cmd', op: 'G1', params: params as any, comment };
    }
    const { E: _omit, ...paramsWithoutE } = params;
    return { type: 'cmd', op: 'G0', params: paramsWithoutE as any, comment };
  },

  enableSteppers(): M17Command {
    return { type: 'cmd', op: 'M17', comment: 'enable steppers' };
  },

  disableSteppers(): M84Command {
    return { type: 'cmd', op: 'M84', params: { X: true, Y: true, E: true }, comment: 'disable motors' };
  },

  absolutePositioning(): G90Command {
    return { type: 'cmd', op: 'G90', comment: 'use absolute positioning' };
  },

  autoHome(): G28Command {
    return { type: 'cmd', op: 'G28', comment: 'home all without mesh bed level' };
  },

  gCodeCompatibilityCheck(printerId: string): M862_3Command {
    return { type: 'cmd', op: 'M862.3', params: { P: quoted(printerId) }, comment: 'printer model check' };
  },

  firmwareFeatureCheck(feature: string): M862_6Command {
    return { type: 'cmd', op: 'M862.6', params: { P: quoted(feature) }, comment: 'FW feature check' };
  },
} as const;
