import { onCleanup, onMount } from 'solid-js';
import { isClientRuntime } from '@/lib/runtime';
import { getShareTokenFromUrl } from '@/WiperTool/domain/sharing';
import { sharedLinkModalOpenedEvent, track } from '@/WiperTool/lib/analytics';
import { useModals } from '@/WiperTool/providers/AppModelProvider';
import { ModalKeys } from '@/WiperTool/ui/modals';

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
