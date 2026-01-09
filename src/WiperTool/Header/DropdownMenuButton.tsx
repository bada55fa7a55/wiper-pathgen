import { actionImportModalOpenedEvent, actionShareModalOpenedEvent, track } from 'WiperTool/lib/analytics';
import { ModalKey, openModal, StepKey, steps } from 'WiperTool/store';
import { Button, Dropdown } from 'components';
import { createSignal } from 'solid-js';
import { twc } from 'styles';

const DropdownWrapper = twc(
  'div',
  `
  relative
  
  block
  `,
);

export function DropdownMenuButton() {
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
    openModal(ModalKey.ImportWipingSequence);
  });
  const handleShareItemClick = createDeferredActionHandler(() => {
    track(actionShareModalOpenedEvent('header'));
    openModal(ModalKey.Share);
  });

  return (
    <DropdownWrapper>
      <Button
        renderAs="button"
        layout="secondary"
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
            isDisabled={!steps()[StepKey.Drawing].isComplete}
            onClick={handleShareItemClick}
          />
        </Dropdown>
      )}
    </DropdownWrapper>
  );
}
