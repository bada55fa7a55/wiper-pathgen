import { isClientRuntime, isDevRuntime } from '@/lib/runtime';
import type { PrinterKey } from '@/WiperTool/domain/printers';
import type { WsWriteAction } from '@/WiperTool/ui/tracking';

type AnalyticsTrigger =
  | 'global_drop'
  | 'page_handler'
  | 'header'
  | 'warning'
  | 'hw_setup'
  | 'footer'
  | 'intro'
  | 'drawing'
  | 'gcode'
  | 'testing'
  | 'calibration'
  | 'settings'
  | 'hwsetup'
  | 'import'
  | 'share'
  | 'share_link';

type AnalyticsMetadata = Record<string, string | number | boolean | null | undefined>;

type PrefixedMetadata<M extends Partial<AnalyticsMetadata>> = {
  [K in keyof M as K extends string ? `data-simple-event-${K}` : never]: M[K];
};

function generateUUID() {
  if (!isClientRuntime) {
    return '';
  }

  const id = window.crypto.randomUUID();
  return id.replace(/-/g, '');
}

if (isClientRuntime && !window.tid) {
  window.tid = generateUUID();
}

function prefixMetadataAttributes<M extends Partial<AnalyticsMetadata>>(metadata: M): PrefixedMetadata<M> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [`data-simple-event-${key}`, value]),
  ) as PrefixedMetadata<M>;
}

function createEventAttributes<T extends AnalyticsTrigger, M extends Partial<AnalyticsMetadata>>({
  event,
  trigger,
  ...metadata
}: { event: string; trigger: T } & M) {
  const traceid = isClientRuntime ? window.tid : '';

  return {
    'data-simple-event': event,
    ...prefixMetadataAttributes({
      trigger,
      ...metadata,
      traceid,
    }),
  };
}

function marshalWsWriteAction(wsWriteAction: WsWriteAction | undefined) {
  if (!wsWriteAction) {
    return ['unknown', undefined];
  }
  switch (wsWriteAction.type) {
    case 'point':
      return ['point', undefined];
    case 'preset':
      return ['preset', wsWriteAction.preset];
    case 'import':
      return ['import', wsWriteAction.source];
    default:
      return unreachable(wsWriteAction);
  }
}

export function analyticsHeaderPrintablesWA2() {
  return createEventAttributes({
    event: 'link_printables_wa2',
    trigger: 'header',
  });
}

export function analyticsWarningPrintablesWA2() {
  return createEventAttributes({
    event: 'link_printables_wa2',
    trigger: 'warning',
  });
}

export function analyticsHwSetupGitHubIssues() {
  return createEventAttributes({
    event: 'link_github_issues',
    trigger: 'hw_setup',
  });
}

export function analyticsHwSetupGitHubPullRequests() {
  return createEventAttributes({
    event: 'link_github_pull_requests',
    trigger: 'hw_setup',
  });
}

export function analyticsFooterPrintablesProfile() {
  return createEventAttributes({
    event: 'link_printables_profile',
    trigger: 'footer',
  });
}

export function analyticsFooterGitHub() {
  return createEventAttributes({
    event: 'link_github',
    trigger: 'footer',
  });
}

export function analyticsFooterGitHubIssues() {
  return createEventAttributes({
    event: 'link_github_issues',
    trigger: 'footer',
  });
}

export function analyticsFooterGitHubPullRequests() {
  return createEventAttributes({
    event: 'link_github_pull_requests',
    trigger: 'footer',
  });
}

export function analyticsFooterGitHash() {
  return createEventAttributes({
    event: 'link_git_hash',
    trigger: 'footer',
  });
}

export function analyticsFooterAgpl() {
  return createEventAttributes({
    event: 'link_agpl',
    trigger: 'footer',
  });
}

export function analyticsFooterHome() {
  return createEventAttributes({
    event: 'link_home',
    trigger: 'footer',
  });
}

export function analyticsIntroPrintablesWA1() {
  return createEventAttributes({
    event: 'link_printables_wa1',
    trigger: 'intro',
  });
}

export function analyticsIntroPrintablesWA2() {
  return createEventAttributes({
    event: 'link_printables_wa2',
    trigger: 'intro',
  });
}

export type AnalyticsEvent = {
  event: string;
  trigger: AnalyticsTrigger;
} & AnalyticsMetadata;

export type AnalyticsEvent2 = {
  event: string;
  trigger: AnalyticsTrigger;
} & AnalyticsMetadata;

export function track(event: AnalyticsEvent) {
  const traceid = isClientRuntime ? window.tid : '';
  const { event: eventName, ...metadata } = event;
  const saEvent = (window as Window & { sa_event?: (name: string, meta?: Record<string, unknown>) => void }).sa_event;

  const eventMetadata = {
    ...metadata,
    traceid,
  };

  if (isDevRuntime) {
    console.group(`Analytics: ${eventName}`);
    if (Object.keys(eventMetadata).length > 0) {
      console.table(eventMetadata);
    } else {
      console.log('No metadata');
    }
    console.groupEnd();
  }

  if (typeof saEvent !== 'function') {
    return;
  }

  saEvent(eventName, eventMetadata);
}

export function simulationStartedEvent(wsWriteAction: WsWriteAction | undefined): AnalyticsEvent {
  const [ws_type, ws_source] = marshalWsWriteAction(wsWriteAction);
  return {
    event: 'action_simulation_started',
    trigger: 'drawing',
    ws_type,
    ws_source,
  };
}

export function simulationStoppedEvent(): AnalyticsEvent {
  return {
    event: 'action_simulation_stopped',
    trigger: 'drawing',
  };
}

export function drawingPathClearedEvent(): AnalyticsEvent {
  return {
    event: 'action_drawing_path_cleared',
    trigger: 'drawing',
  };
}

export function drawingPathUndoEvent(): AnalyticsEvent {
  return {
    event: 'action_drawing_path_undo',
    trigger: 'drawing',
  };
}

export function drawingPointAddedEvent(): AnalyticsEvent {
  return {
    event: 'action_drawing_point_added',
    trigger: 'drawing',
  };
}

export function drawingPresetAppliedEvent(preset: string): AnalyticsEvent {
  return {
    event: 'action_drawing_preset_applied',
    trigger: 'drawing',
    preset,
  };
}

export function gCodeCopiedEvent(wsWriteAction: WsWriteAction | undefined): AnalyticsEvent {
  const [ws_type, ws_source] = marshalWsWriteAction(wsWriteAction);
  return {
    event: 'action_gcode_copied',
    trigger: 'gcode',
    ws_type,
    ws_source,
  };
}

export function calibrationValuesUsedEvent(
  trigger: AnalyticsTrigger,
  printer: PrinterKey,
  x: number | undefined,
  y: number | undefined,
  z: number | undefined,
): AnalyticsEvent {
  return {
    event: 'calibration_values_used',
    trigger,
    printer,
    x,
    y,
    z,
  };
}

export function settingsUsedEvent(
  trigger: AnalyticsTrigger,
  printer: PrinterKey,
  feedRate: number | undefined,
  plungeDepth: number | undefined,
  zLift: number | undefined,
): AnalyticsEvent {
  return {
    event: 'settings_used',
    trigger,
    printer,
    feedRate,
    plungeDepth,
    zLift,
  };
}

export function testGCodeDownloadedEvent(wsWriteAction: WsWriteAction | undefined): AnalyticsEvent {
  const [ws_type, ws_source] = marshalWsWriteAction(wsWriteAction);
  return {
    event: 'action_test_gcode_downloaded',
    trigger: 'testing',
    ws_type,
    ws_source,
  };
}

export function calibrationValueChangedEvent(field: string): AnalyticsEvent {
  return {
    event: 'action_calibration_value_changed',
    trigger: 'calibration',
    field,
  };
}

export function settingsValueChangedEvent(field: string, trigger: 'settings' | 'hwsetup'): AnalyticsEvent {
  return {
    event: 'action_settings_value_changed',
    trigger,
    field,
  };
}

export function actionImportModalOpenedEvent(trigger: AnalyticsTrigger): AnalyticsEvent {
  return {
    event: 'action_import_modal_opened',
    trigger,
  };
}

export function actionShareModalOpenedEvent(trigger: AnalyticsTrigger): AnalyticsEvent {
  return {
    event: 'action_share_modal_opened',
    trigger,
  };
}

export function sharedLinkModalOpenedEvent(): AnalyticsEvent {
  return {
    event: 'action_shared_link_modal_opened',
    trigger: 'page_handler',
  };
}

export function actionShareLinkModalOpenedEvent(trigger: AnalyticsTrigger): AnalyticsEvent {
  return {
    event: 'action_share_link_modal_opened',
    trigger,
  };
}

export function actionWipingSequenceExportedEvent(
  trigger: AnalyticsTrigger,
  wsWriteAction: WsWriteAction | undefined,
): AnalyticsEvent {
  const [ws_type, ws_source] = marshalWsWriteAction(wsWriteAction);
  return {
    event: 'action_wiping_sequence_exported',
    trigger,
    ws_type,
    ws_source,
  };
}

export function actionShareLinkCopiedEvent(wsWriteAction: WsWriteAction | undefined): AnalyticsEvent {
  const [ws_type, ws_source] = marshalWsWriteAction(wsWriteAction);
  return {
    event: 'action_share_link_copied',
    trigger: 'share_link',
    ws_type,
    ws_source,
  };
}

type AnalyticsImportSource = 'token' | 'file';

export function actionWipingSequenceImportedEvent(source: AnalyticsImportSource): AnalyticsEvent {
  return {
    event: 'action_wiping_sequence_imported',
    source,
    trigger: 'import',
  };
}
export function actionFileDroppedEvent(fileType: string): AnalyticsEvent {
  return {
    event: 'action_file_dropped',
    trigger: 'global_drop',
    fileType,
  };
}
