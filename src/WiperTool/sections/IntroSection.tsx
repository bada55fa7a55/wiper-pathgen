import { Link, Section, SectionColumn, SectionColumns, SectionTitle } from '@/components';
import { wiperArmV1Link, wiperArmv2Link } from '@/WiperTool/configuration';
import { analyticsIntroPrintablesWA1, analyticsIntroPrintablesWA2 } from '@/WiperTool/lib/analytics';

export function IntroSection() {
  return (
    <Section id="intro">
      <SectionTitle>Introduction</SectionTitle>
      <SectionColumns>
        <SectionColumn>
          <p>
            Use this web tool to draw a custom nozzle wiping path. It currently supports the Prusa Core One with Bambu
            Lab A1 silicone pads and pad mounting arms that place the pad at the front of the printer.
          </p>
          <p>
            The recommended option is the{' '}
            <Link
              href={wiperArmv2Link.href}
              {...analyticsIntroPrintablesWA2()}
            >
              {wiperArmv2Link.label}
            </Link>{' '}
            wiping arm because it places the silicone pad fully within reach of the nozzle. Other arms, including{' '}
            <Link
              href={wiperArmV1Link.href}
              {...analyticsIntroPrintablesWA1()}
            >
              version 1
            </Link>
            , may work but can leave part of the pad outside the nozzle's reach.
          </p>
          <p>The sections below walk you step by step through creating your nozzle wiping sequence.</p>
        </SectionColumn>
      </SectionColumns>
    </Section>
  );
}
