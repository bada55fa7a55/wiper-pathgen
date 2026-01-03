function createEventAttributes({ event, trigger }: { event: string; trigger: string }) {
  return {
    'data-simple-event': event,
    'data-simple-event-trigger': trigger,
  };
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
  trigger: string;
} & Record<string, string | number | boolean | null | undefined>;

export function track(event: AnalyticsEvent) {
  const { event: eventName, ...metadata } = event;
  const saEvent = (window as Window & { sa_event?: (name: string, meta?: Record<string, unknown>) => void }).sa_event;

  if (import.meta.env.DEV) {
    console.group(`Analytics: ${eventName}`);
    if (Object.keys(metadata).length > 0) {
      console.table(metadata);
    } else {
      console.log('No metadata');
    }
    console.groupEnd();
  }

  if (typeof saEvent !== 'function') {
    return;
  }

  saEvent(eventName, metadata);
}

export function simulationStartedEvent(): AnalyticsEvent {
  return {
    event: 'action_simulation_started',
    trigger: 'drawing',
  };
}

export function simulationStoppedEvent(): AnalyticsEvent {
  return {
    event: 'action_simulation_started',
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

export function gCodeCopiedEvent(): AnalyticsEvent {
  return {
    event: 'action_gcode_copied',
    trigger: 'gcode',
  };
}

export function testGCodeDownloadedEvent(): AnalyticsEvent {
  return {
    event: 'action_test_gcode_downloaded',
    trigger: 'testing',
  };
}

export function calibrationValueChangedEvent(field: string): AnalyticsEvent {
  return {
    event: 'action_calibration_value_changed',
    trigger: 'calibration',
    field,
  };
}

export function settingsValueChangedEvent(field: string): AnalyticsEvent {
  return {
    event: 'action_settings_value_changed',
    trigger: 'settings',
    field,
  };
}
