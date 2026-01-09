import { sharedLinkModalOpenedEvent, track } from 'WiperTool/lib/analytics';
import { isModalOpen, ModalKey, openModal } from 'WiperTool/store';
import { onCleanup, onMount } from 'solid-js';
import { getShareTokenFromUrl } from './sharing';

export function useShareHashModal() {
  const handleShareHash = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = getShareTokenFromUrl();
    if (!token) {
      return;
    }

    if (!isModalOpen(ModalKey.ImportSharedWipingSequence)) {
      track(sharedLinkModalOpenedEvent());
      openModal(ModalKey.ImportSharedWipingSequence);
    }
  };

  onMount(() => {
    handleShareHash();
    window.addEventListener('hashchange', handleShareHash);
  });

  onCleanup(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('hashchange', handleShareHash);
  });
}
