import { steps } from 'WiperTool/store';
import { Button, Dropdown } from 'components';
import { createSignal } from 'solid-js';
import { twc } from 'styles';

const DropdownWrapper = twc(
  'div',
  `
  relative
  
  block
  lg:hidden
  `,
);

export function StepOMeterDropdownButton() {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let triggerRef: HTMLButtonElement | undefined;

  const getStepIcon = (stepIndex: number, isComplete: boolean) => {
    if (isComplete) {
      return 'check_circle';
    }

    return `counter_${stepIndex + 1}`;
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen((previousValue) => !previousValue);
  };

  return (
    <DropdownWrapper>
      <Button
        renderAs="button"
        layout="ghost"
        msIcon="checklist_rtl"
        label="Steps"
        title="Steps checklist"
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
          {Object.values(steps()).map((step, index) => (
            <Button
              renderAs="link"
              layout={step.isComplete ? 'list-success' : 'list'}
              msIcon={getStepIcon(index, step.isComplete)}
              label={step.label}
              href={`#${step.anchor}`}
              onClick={handleCloseDropdown}
            />
          ))}
        </Dropdown>
      )}
    </DropdownWrapper>
  );
}
