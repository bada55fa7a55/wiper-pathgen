import { createStore } from 'solid-js/store';
import type { PresetKey } from '@/WiperTool/domain/presets/model';

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
  lastTestedWipingSequenceRevision: number;
};

export function createTrackingStore() {
  const initialState: TrackingState = {
    lastWipingSequenceWrite: undefined,
    lastTestedWipingSequenceRevision: 0,
  };

  const [state, set] = createStore<TrackingState>(initialState);

  const actions = {
    setLastWipingSequenceWrite(writeAction: WsWriteAction) {
      set('lastWipingSequenceWrite', writeAction);
    },
    setLastTestedWipingSequenceRevision(revision: number) {
      set('lastTestedWipingSequenceRevision', revision);
    },
  };

  return { state, actions } as const;
}
