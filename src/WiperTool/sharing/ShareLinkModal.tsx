import { actionShareLinkCopiedEvent, track } from 'WiperTool/lib/analytics';
import { clearModals, closeModal, isModalOpen, ModalKey, settings, wipingSequence } from 'WiperTool/store';
import { Button, CodeTextArea, Modal } from 'components';
import { createMemo, createSignal } from 'solid-js';
import { twc } from 'styles';
import { buildShareUrl, encodeShareToken } from './sharing';

const Content = twc(
  'div',
  `
  flex
  gap-4
  
  flex-col
  items-center
  `,
);

const TextAreaWrapper = twc(
  'div',
  `
  flex
  flex-col
  gap-1
  w-full
  h-48
  `,
);

const Actions = twc(
  'div',
  `
  flex
  justify-end
  items-center
  gap-3
  w-full
  `,
);

const Label = twc(
  'div',
  `
  text-sm
  font-bold
  `,
);

const Description = twc(
  'p',
  `
  text-sm
  `,
);

export function ShareLinkModal() {
  const [copied, setCopied] = createSignal(false);
  let copyTimeout: number | undefined;

  const encoded = createMemo(() => {
    return encodeShareToken({
      padKey: settings.padType,
      printerKey: settings.printer,
      wipingSequence: wipingSequence(),
    });
  });

  const showCopied = () => {
    setCopied(true);
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    copyTimeout = window.setTimeout(() => setCopied(false), 1500);
  };

  const handleCloseModal = () => {
    clearModals();
  };

  const handleBackClick = () => {
    closeModal();
  };

  const handleCopyLinkClick = () => {
    track(actionShareLinkCopiedEvent());
    navigator.clipboard.writeText(buildShareUrl(encoded()));
    showCopied();
  };

  return (
    <Modal
      title="Share Link"
      footerContent="Links are private and are not saved on a server."
      withFooterContentAboveActions
      isOpen={isModalOpen(ModalKey.ShareLink)}
      withCloseButton
      onClose={handleCloseModal}
    >
      <Content>
        <TextAreaWrapper>
          <Label>Link:</Label>
          <CodeTextArea
            readOnly
            value={buildShareUrl(encoded())}
          />
        </TextAreaWrapper>
        <Description>
          Copy the above link and share it via email, your favorite messenger app, or post it online.
        </Description>
        <Actions>
          <Button
            renderAs="button"
            layout="secondary"
            label="Back"
            onClick={handleBackClick}
          />
          <Button
            renderAs="button"
            layout="primary"
            label="Copy link"
            msIcon="content_copy"
            status={copied() ? 'success' : undefined}
            isDisabled={copied()}
            onClick={handleCopyLinkClick}
          />
        </Actions>
      </Content>
    </Modal>
  );
}
