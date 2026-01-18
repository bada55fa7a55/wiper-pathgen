import type { PrinterKey, PrinterProperties } from 'WiperTool/domain/printers';
import { PrinterKeys, printerProperties } from 'WiperTool/domain/printers';
import { settingsValueChangedEvent, track } from 'WiperTool/lib/analytics';
import { useSettings } from 'WiperTool/providers/AppModelProvider';
import { For } from 'solid-js';
import { twc } from 'styles';
import prusaCoreOneIcon from './assets/COREONE_thumbnail.png?url';
import prusaCoreOneLIcon from './assets/COREONEL_thumbnail.png?url';
import prusaMk4Icon from './assets/MK4_thumbnail.png?url';
import prusaXlIcon from './assets/XL5_thumbnail.png?url';
import { PrinterButton } from './PrinterButton';

const Container = twc(
  'div',
  `
    flex
    flex-wrap
    flex-col
    sm:flex-row
    gap-2
  `,
);

export function PrinterPicker() {
  const settings = useSettings();

  const statusRank: Record<PrinterProperties['status'], number> = {
    supported: 0,
    'in-progress': 1,
    planned: 2,
  };

  const sortedPrinters = [...Object.values(printerProperties)].sort(
    (a, b) => statusRank[a.status] - statusRank[b.status],
  );

  const printerIcons = {
    [PrinterKeys.PrusaCoreOne]: prusaCoreOneIcon,
    [PrinterKeys.PrusaCoreOneL]: prusaCoreOneLIcon,
    [PrinterKeys.PrusaXl]: prusaXlIcon,
    [PrinterKeys.PrusaMk4]: prusaMk4Icon,
  };

  const handlePrinterButtonClick = (printerKey: PrinterKey) => () => {
    track(settingsValueChangedEvent('printer', 'hwsetup'));
    settings.actions.setSettings('printer', printerKey);
  };

  return (
    <Container>
      <For each={sortedPrinters}>
        {({ key, name, status }) => (
          <PrinterButton
            image={printerIcons[key]}
            isEnlargedImage={key === PrinterKeys.PrusaCoreOneL}
            label={name}
            status={status}
            isSelected={key === settings.printer()}
            onClick={handlePrinterButtonClick(key)}
          />
        )}
      </For>
    </Container>
  );
}
