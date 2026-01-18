import { ImportSharedWipingSequenceModal } from 'WiperTool/features/sharing/ImportSharedWipingSequenceModal';
import { ImportWipingSequenceModal } from 'WiperTool/features/sharing/ImportWipingSequenceModal';
import { ShareLinkModal } from 'WiperTool/features/sharing/ShareLinkModal';
import { ShareModal } from 'WiperTool/features/sharing/ShareModal';
import { useGlobalFileDrop } from 'WiperTool/features/sharing/useGlobalFileDrop';
import { useShareHashModal } from 'WiperTool/features/sharing/useShareHashModal';
import { AppModelProvider } from 'WiperTool/providers/AppModelProvider';
import { Footer } from 'WiperTool/ui/layout/Footer';
import { Header } from 'WiperTool/ui/layout/Header';
import { ManagedModals, ModalKeys } from 'WiperTool/ui/modals';
import type { ParentProps } from 'solid-js';
import { Toaster } from 'solid-toast';
import { twc } from 'styles/helpers';

const ShellContainer = twc(
  'div',
  `
  max-w
  flex
  flex-col
  items-center
  gap-10
  `,
);

const Main = twc(
  'main',
  `
  w-full
  max-w-screen-xl
  flex
  flex-col
  items-center
  gap-10
  `,
);

function Shell(props: ParentProps) {
  useShareHashModal();
  useGlobalFileDrop();

  return <ShellContainer>{props.children}</ShellContainer>;
}

export function AppShell(props: ParentProps) {
  return (
    <AppModelProvider>
      <Shell>
        <Header />
        <Main>{props.children}</Main>
        <Footer />
        <ManagedModals>
          {(modal) => (
            <>
              <ShareModal
                isOpen={modal.isModalOpen(ModalKeys.Share)}
                onOpenShareLink={() => modal.openSubModal(ModalKeys.ShareLink)}
                onOpenImport={() => modal.openModal(ModalKeys.ImportWipingSequence)}
                onClose={modal.clearModals}
              />
              <ShareLinkModal
                isOpen={modal.isModalOpen(ModalKeys.ShareLink)}
                onBack={modal.isSubModal() ? modal.closeModal : undefined}
                onClose={modal.clearModals}
              />
              <ImportWipingSequenceModal
                isOpen={modal.isModalOpen(ModalKeys.ImportWipingSequence)}
                onClose={modal.clearModals}
              />
              <ImportSharedWipingSequenceModal
                isOpen={modal.isModalOpen(ModalKeys.ImportSharedWipingSequence)}
                onClose={modal.clearModals}
              />
            </>
          )}
        </ManagedModals>
        <Toaster />
      </Shell>
    </AppModelProvider>
  );
}
