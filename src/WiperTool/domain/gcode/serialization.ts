import type { GCodeCommand, GCodeProgram } from './commands';

type ParamJoin = '' | ' ';
type ParamFormat = { join?: ParamJoin; quote?: boolean };

const paramsOrder: Record<string, string[]> = {
  G0: ['X', 'Y', 'Z', 'E', 'F'],
  G1: ['X', 'Y', 'Z', 'E', 'F'],
  M84: ['X', 'Y', 'E'],
  'M862.3': ['P'],
  'M862.6': ['P'],
};

const paramsFormat: Record<string, Record<string, ParamFormat>> = {
  'M862.3': { P: { join: ' ', quote: true } },
  'M862.6': { P: { join: '', quote: true } },
};

function stableKeyOrder(params: Record<string, unknown>, op: string): string[] {
  const preferred = paramsOrder[op];
  const keys = Object.keys(params);
  if (!preferred) {
    return keys.sort((a, b) => a.localeCompare(b));
  }

  const set = new Set(keys);
  const ordered: string[] = [];

  for (const key of preferred) {
    if (set.delete(key)) {
      ordered.push(key);
    }
  }
  ordered.push(...Array.from(set).sort((a, b) => a.localeCompare(b)));

  return ordered;
}

function ensureQuoted(s: string): string {
  if (s.startsWith('"') && s.endsWith('"')) {
    return s;
  }
  return `"${s}"`;
}

type ParamValue = string | number | boolean | null | undefined;
type ParamMap = Record<string, ParamValue>;

function getParams(command: GCodeCommand): ParamMap | undefined {
  if (command.type !== 'cmd') {
    return undefined;
  }
  if (!('params' in command) || !command.params) {
    return undefined;
  }
  return command.params as ParamMap;
}

export function serializeGCode(program: GCodeProgram) {
  return program.map((command) => {
    if (command.type === 'comment') {
      return `; ${command.text}`;
    }

    if (command.type === 'blank') {
      return '';
    }

    const comment = command.comment ? ` ; ${command.comment}` : '';
    const params = getParams(command);

    if (!params) {
      return `${command.op}${comment}`;
    }

    const keys = stableKeyOrder(params, command.op);
    const parts: string[] = [command.op];

    for (const key of keys) {
      const value = params[key];

      if (value === true) {
        parts.push(key);
        continue;
      }

      if (typeof value === 'string') {
        const format = paramsFormat[command.op]?.[key];
        const formattedValue = format?.quote ? ensureQuoted(value) : value;
        const join: ParamJoin = format?.join ?? '';

        if (join === ' ') {
          parts.push(key, formattedValue);
        } else {
          parts.push(`${key}${formattedValue}`);
        }
        continue;
      }

      if (value === undefined || value === null || value === false) {
        continue;
      }

      parts.push(`${key}${String(value)}`);
    }

    return parts.join(' ') + comment;
  });
}
