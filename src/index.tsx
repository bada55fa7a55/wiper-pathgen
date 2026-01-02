/* @refresh reload */
import { WiperTool } from 'WiperTool';
import { hydrate } from 'solid-js/web';
import { isClient } from 'lib/runtime';
import './index.css';

declare global {
  interface Window {
    _$HY?: {
      completed?: WeakSet<object>;
      events?: unknown[];
      r?: Record<string, unknown>;
      done?: boolean;
    };
  }
}

if (isClient) {
  // biome-ignore lint/suspicious/noAssignInExpressions: Assign to both window and hydrationState
  const hydrationState = (window._$HY ||= {});
  hydrationState.completed ||= new WeakSet();
  hydrationState.events ||= [];
  hydrationState.r ||= {};
  hydrationState.done = true;

  const root = document.getElementById('root');

  hydrate(
    () => (
      <>
        <WiperTool />
      </>
    ),
    root!,
  );
}
