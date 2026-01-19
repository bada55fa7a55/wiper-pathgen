/* @refresh reload */

import { hydrate } from 'solid-js/web';
import { isClientRuntime } from '@/lib/runtime';
import { WiperTool } from '@/WiperTool';
import '@fontsource-variable/material-symbols-rounded';
import './index.css';

if (isClientRuntime) {
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
