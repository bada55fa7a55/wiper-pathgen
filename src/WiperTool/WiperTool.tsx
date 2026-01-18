import { ShareLinkModal } from 'WiperTool/features/sharing/ShareLinkModal';
import { ShareModal } from 'WiperTool/features/sharing/ShareModal';
import { useGlobalFileDrop } from 'WiperTool/features/sharing/useGlobalFileDrop';
import { useShareHashModal } from 'WiperTool/features/sharing/useShareHashModal';
import { ManagedModals } from 'WiperTool/modals';
import { AppModelProvider } from 'WiperTool/providers/AppModelProvider';
import { ModalKeys } from 'WiperTool/ui/modals';
import type { ParentProps } from 'solid-js';
import { Toaster } from 'solid-toast';
import { twc } from 'styles/helpers';
import { ClaibrationSection } from './CalibrationSection';
import { DrawingSection } from './DrawingSection';
import { Footer } from './Footer';
import { ImportSharedWipingSequenceModal } from './features/sharing/ImportSharedWipingSequenceModal';
import { ImportWipingSequenceModal } from './features/sharing/ImportWipingSequenceModal';
import { HardwareSetupSection } from './HardwareSetupSection';
import { Header } from './Header';
import { InstallationSection } from './InstallationSection';
import { IntroSection } from './IntroSection';
import { SettingsSection } from './SettingsSection';
import { TestingSection } from './TestingSection';

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

export function WiperTool() {
  return (
    <AppModelProvider>
      <Shell>
        <Header />
        <Main>
          <IntroSection />
          <HardwareSetupSection />
          <ClaibrationSection />
          <SettingsSection />
          <DrawingSection />
          <TestingSection />
          <InstallationSection />
        </Main>
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
