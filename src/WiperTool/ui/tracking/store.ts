import type { PresetKey } from 'WiperTool/domain/presets/model';
import { createStore } from 'solid-js/store';

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

type TrackingState = {
  lastWipingSequenceWrite: WsWriteAction | undefined;
};

export function createTrackingStore() {
  const initialState: TrackingState = {
    lastWipingSequenceWrite: undefined,
  };

  const [state, set] = createStore<TrackingState>(initialState);

  const actions = {
    setLastWipingSequenceWrite(writeAction: WsWriteAction) {
      set('lastWipingSequenceWrite', writeAction);
    },
  };

  return { state, actions } as const;
}
