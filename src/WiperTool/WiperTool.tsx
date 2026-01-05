import { Toaster } from 'solid-toast';
import { twc } from 'styles/helpers';
import { ClaibrationSection } from './CalibrationSection';
import { DrawingSection } from './DrawingSection';
import { Footer } from './Footer';
import { HardwareSetupSection } from './HardwareSetupSection';
import { Header } from './Header';
import { InstallationSection } from './InstallationSection';
import { IntroSection } from './IntroSection';
import { SettingsSection } from './SettingsSection';
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
      <Toaster />
    </Shell>
  );
}
