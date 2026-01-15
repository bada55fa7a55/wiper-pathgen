import { Toaster } from 'solid-toast';
import { twc } from 'styles/helpers';
import { ClaibrationSection } from './CalibrationSection';
import { DrawingSection } from './DrawingSection';
import { Footer } from './Footer';
import { HardwareSetupSection } from './HardwareSetupSection';
import { Header } from './Header';
import { InstallationSection } from './InstallationSection';
import { IntroSection } from './IntroSection';
import { ManagedModals } from './modals';
import { SettingsSection } from './SettingsSection';
import { ImportSharedWipingSequenceModal } from './sharing/ImportSharedWipingSequenceModal';
import { ImportWipingSequenceModal } from './sharing/ImportWipingSequenceModal';
import { ShareLinkModal } from './sharing/ShareLinkModal';
import { ShareModal } from './sharing/ShareModal';
import { useGlobalFileDrop } from './sharing/useGlobalFileDrop';
import { useShareHashModal } from './sharing/useShareHashModal';
import { ModalKey } from './store';
import { TestingSection } from './TestingSection';

const Shell = twc(
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

export function WiperTool() {
  useShareHashModal();
  useGlobalFileDrop();

  return (
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
              isOpen={modal.isModalOpen(ModalKey.Share)}
              onOpenShareLink={() => modal.openSubModal(ModalKey.ShareLink)}
              onOpenImport={() => modal.openModal(ModalKey.ImportWipingSequence)}
              onClose={modal.clearModals}
            />
            <ShareLinkModal
              isOpen={modal.isModalOpen(ModalKey.ShareLink)}
              onBack={modal.isSubModal() ? modal.closeModal : undefined}
              onClose={modal.clearModals}
            />
            <ImportWipingSequenceModal
              isOpen={modal.isModalOpen(ModalKey.ImportWipingSequence)}
              onClose={modal.clearModals}
            />
            <ImportSharedWipingSequenceModal
              isOpen={modal.isModalOpen(ModalKey.ImportSharedWipingSequence)}
              onClose={modal.clearModals}
            />
          </>
        )}
      </ManagedModals>
      <Toaster />
    </Shell>
  );
}
