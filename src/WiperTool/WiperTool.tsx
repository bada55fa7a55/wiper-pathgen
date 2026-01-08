import { Toaster } from 'solid-toast';
import { twc } from 'styles/helpers';
import { ClaibrationSection } from './CalibrationSection';
import { DrawingSection } from './DrawingSection';
import { Footer } from './Footer';
import { HardwareSetupSection } from './HardwareSetupSection';
import { Header } from './Header';
import { InstallationSection } from './InstallationSection';
import { IntroSection } from './IntroSection';
import { ModalContainer } from './ModalContainer/ModalContainer';
import { SettingsSection } from './SettingsSection';
import { ImportSharedWipingSequenceModal } from './sharing/ImportSharedWipingSequenceModal';
import { ImportWipingSequenceModal } from './sharing/ImportWipingSequenceModal';
import { ShareLinkModal } from './sharing/ShareLinkModal';
import { ShareModal } from './sharing/ShareModal';
import { useShareHashModal } from './sharing/useShareHashModal';
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
      <ModalContainer>
        <ShareModal />
        <ShareLinkModal />
        <ImportWipingSequenceModal />
        <ImportSharedWipingSequenceModal />
      </ModalContainer>
      <Toaster />
    </Shell>
  );
}
