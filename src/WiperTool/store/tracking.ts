import type { PresetKey } from 'WiperTool/DrawingSection/PresetButtons/presets';
import { createSignal } from 'solid-js';

type PointWsWriteAction = {
  type: 'point';
};

type PresetWsWriteAction = {
  type: 'preset';
  preset: PresetKey;
};

type ImportWsWriteAction = {
  type: 'import';
  source: 'file' | 'token';
};

export type WsWriteAction = PointWsWriteAction | PresetWsWriteAction | ImportWsWriteAction;

export const [lastWipingSequenceWrite, setLastWipingSequenceWrite] = createSignal<WsWriteAction | undefined>(undefined);
