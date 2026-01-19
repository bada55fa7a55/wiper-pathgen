import { ClaibrationSection } from './sections/CalibrationSection';
import { DrawingSection } from './sections/DrawingSection';
import { HardwareSetupSection } from './sections/HardwareSetupSection';
import { InstallationSection } from './sections/InstallationSection';
import { IntroSection } from './sections/IntroSection';
import { SettingsSection } from './sections/SettingsSection';
import { TestingSection } from './sections/TestingSection';
import { AppShell } from './ui/layout/AppShell';

export function WiperTool() {
  return (
    <AppShell>
      <IntroSection />
      <HardwareSetupSection />
      <ClaibrationSection />
      <SettingsSection />
      <DrawingSection />
      <TestingSection />
      <InstallationSection />
    </AppShell>
  );
}
