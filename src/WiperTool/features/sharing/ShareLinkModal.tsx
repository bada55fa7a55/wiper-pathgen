import { createMemo, createSignal } from 'solid-js';
import { Button, CodeTextArea, Modal } from '@/components';
import { twc } from '@/styles';
import { buildShareUrl, encodeShareToken } from '@/WiperTool/domain/sharing';
import { actionShareLinkCopiedEvent, track } from '@/WiperTool/lib/analytics';
import { useSettings, useTracking, useWipingSequence } from '@/WiperTool/providers/AppModelProvider';

const Content = twc(
  'div',
  `
  flex
  gap-4
  
  flex-col
  `,
);

const LinkPreviewContainer = twc(
  'div',
  `
  flex
  gap-2
  
  flex-col
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

const PreviewDescription = twc(
  'p',
  `
  text-sm
  `,
);

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
};

export function ShareLinkModal(props: Props) {
  const settings = useSettings();
  const tracking = useTracking();
  const wipingSequence = useWipingSequence();

  const [copied, setCopied] = createSignal(false);
  let copyTimeout: number | undefined;

  const encoded = createMemo(() => {
    return encodeShareToken({
      padKey: settings.padType(),
      printerKey: settings.printer(),
      wipingSequence: wipingSequence.wipingSteps(),
    });
  });

  const showCopied = () => {
    setCopied(true);
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    copyTimeout = window.setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyLinkClick = () => {
    track(actionShareLinkCopiedEvent(tracking.lastWipingSequenceWrite()));
    navigator.clipboard.writeText(buildShareUrl(encoded()));
    showCopied();
  };

  return (
    <Modal
      title="Share Link"
      footerContent={
        <>
          Links are private and are not saved on a server. <br />
          The entire wiping sequence is contained in the link.
        </>
      }
      withFooterContentAboveActions
      isOpen={props.isOpen}
      withCloseButton
      onClose={props.onClose}
    >
      <Content>
        <p>Copy the link below and share it via email, your favorite messenger app, or post it online.</p>
        <LinkPreviewContainer>
          <TextAreaWrapper>
            <Label>Link:</Label>
            <CodeTextArea
              readOnly
              value={buildShareUrl(encoded())}
            />
          </TextAreaWrapper>
          <PreviewDescription>The link contains the full wiping sequence.</PreviewDescription>
        </LinkPreviewContainer>
        <Actions>
          {props.onBack && (
            <Button
              renderAs="button"
              layout="secondary"
              label="Back"
              onClick={props.onBack}
            />
          )}
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
