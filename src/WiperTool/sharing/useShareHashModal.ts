import { useModals } from 'WiperTool/AppModelProvider';
import { sharedLinkModalOpenedEvent, track } from 'WiperTool/lib/analytics';
import { ModalKeys } from 'WiperTool/ui/modals';
import { isClientRuntime } from 'lib/runtime';
import { onCleanup, onMount } from 'solid-js';
import { getShareTokenFromUrl } from './sharing';

export function useShareHashModal() {
  const modals = useModals();

  const handleShareHash = () => {
    const token = getShareTokenFromUrl();
    if (!token) {
      return;
    }

    if (!modals.isModalOpen(ModalKeys.ImportSharedWipingSequence)) {
      track(sharedLinkModalOpenedEvent());
      modals.actions.openModal(ModalKeys.ImportSharedWipingSequence);
    }
  };

  onMount(() => {
    handleShareHash();
    window.addEventListener('hashchange', handleShareHash);
  });

  onCleanup(() => {
    if (!isClientRuntime) {
      return;
    }

    window.removeEventListener('hashchange', handleShareHash);
  });
}
