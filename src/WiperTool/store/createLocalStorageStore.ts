import { createEffect, onCleanup } from 'solid-js';
import type { SetStoreFunction, Store } from 'solid-js/store';
import { createStore, reconcile } from 'solid-js/store';

/**
 * Create store that syncs with localStorage
 * @param name - The localStorage key
 * @param init - The initial state object
 */
export function createLocalStorageStore<T extends object>(name: string, init: T): [Store<T>, SetStoreFunction<T>] {
  const localState = localStorage.getItem(name);

  const [state, setState] = createStore<T>(localState ? JSON.parse(localState) : init);

  createEffect(() => {
    localStorage.setItem(name, JSON.stringify(state));
  });

  const onStorage = (e: StorageEvent) => {
    if (e.key === name && e.newValue) {
      const newData = JSON.parse(e.newValue);
      setState(reconcile(newData));
    }
  };

  window.addEventListener('storage', onStorage);
  onCleanup(() => window.removeEventListener('storage', onStorage));

  return [state, setState];
}
