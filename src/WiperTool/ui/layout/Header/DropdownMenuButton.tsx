import { createSignal } from 'solid-js';
import { Button, Dropdown } from '@/components';
import { twc } from '@/styles';
import { actionImportModalOpenedEvent, actionShareModalOpenedEvent, track } from '@/WiperTool/lib/analytics';
import { useModals, useSteps } from '@/WiperTool/providers/AppModelProvider';
import { ModalKeys } from '@/WiperTool/ui/modals';
import { StepKeys } from '@/WiperTool/ui/steps';

const DropdownWrapper = twc(
  'div',
  `
  relative
  
  block
  `,
);

type Props = {
  layout: 'secondary' | 'ghost';
};

export function DropdownMenuButton(props: Props) {
  const { steps } = useSteps();
  const modals = useModals();

  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let triggerRef: HTMLButtonElement | undefined;

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const createDeferredActionHandler = (action: () => void) => {
    return () => {
      handleCloseDropdown();
      window.requestAnimationFrame(action);
    };
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen((previousValue) => !previousValue);
  };

  const handleImportWipingSequenceItemClick = createDeferredActionHandler(() => {
    track(actionImportModalOpenedEvent('header'));
    modals.actions.openModal(ModalKeys.ImportWipingSequence);
  });
  const handleShareItemClick = createDeferredActionHandler(() => {
    track(actionShareModalOpenedEvent('header'));
    modals.actions.openModal(ModalKeys.Share);
  });

  return (
    <DropdownWrapper>
      <Button
        renderAs="button"
        layout={props.layout}
        msIcon={isDropdownOpen() ? 'menu_open' : 'menu'}
        label="Export & share"
        title="Menu"
        ref={(el) => {
          triggerRef = el;
        }}
        withHiddenLabel
        onClick={handleToggleDropdown}
      />
      {isDropdownOpen() && (
        <Dropdown
          position="right"
          onClose={handleCloseDropdown}
          ignore={[() => triggerRef]}
          anchor={() => triggerRef}
        >
          <Button
            renderAs="button"
            layout="list"
            msIcon="file_open"
            label="Import wiping sequence"
            onClick={handleImportWipingSequenceItemClick}
          />
          <Button
            renderAs="button"
            layout="list"
            msIcon="share"
            label="Export or share wiping sequence"
            isDisabled={!steps()[StepKeys.Drawing].isComplete}
            onClick={handleShareItemClick}
          />
        </Dropdown>
      )}
    </DropdownWrapper>
  );
}
