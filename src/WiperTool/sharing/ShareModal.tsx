import { createShareFile, SHARE_FILE_EXTENSION } from 'WiperTool/lib/sharing';
import { clearModals, isModalOpen, ModalKey, openSubModal, settings, wipingSequence } from 'WiperTool/store';
import { Button, MaterialSymbol, Modal } from 'components';
import { createSignal } from 'solid-js';
import toast from 'solid-toast';
import { twc } from 'styles';
import { useSaveFile } from './useSaveFile';

const ContentWrapper = twc(
  'div',
  `
  flex
  gap-8
  
  flex-col
  items-center

  sm:flex-row
  sm:justify-evenly
  sm:items-stretch
  `,
);

const IconCircle = twc(
  'div',
  `
  flex
  justify-center
  items-center
  rounded-full
  w-24
  h-24
  bg-porange-700/50
  `,
);

const ShareOption = twc(
  'div',
  `
    flex
    flex-col
    items-center
    gap-4
    text-center
    w-48

    sm:w-48
  `,
);

const ShareOptionTitle = twc(
  'h4',
  `
  font-bold
  text-md
  `,
);

const ShareOptionDescription = twc(
  'p',
  `
  text-xs
  grow
  `,
);

const ShareAction = twc(
  'div',
  `
  flex
  flex-col
  w-full
  `,
);

export function ShareModal() {
  const { saveFile } = useSaveFile();
  const [isSaving, setIsSaving] = createSignal(false);

  const handleCloseModal = () => {
    clearModals();
  };

  const handleGetLinkClick = () => {
    openSubModal(ModalKey.ShareLink);
  };

  const handleExportFileClick = async () => {
    setIsSaving(true);
    const { blob, fileName } = createShareFile({
      padKey: settings.padType,
      printerKey: settings.printer,
      wipingSequence: wipingSequence(),
    });

    try {
      const wasSaved = await saveFile({
        blob,
        fileName,
        typeDescription: 'Wiping sequence JSON file',
        mimeType: 'application/json',
        extensions: [`.${SHARE_FILE_EXTENSION}`],
      });

      if (wasSaved) {
        handleCloseModal();
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title="Sharing Is Caring"
      footerContent="Files and links are private and are not saved on a server."
      isOpen={isModalOpen(ModalKey.Share)}
      onClose={handleCloseModal}
    >
      <ContentWrapper>
        <ShareOption>
          <IconCircle>
            <MaterialSymbol
              size={48}
              symbol="file_save"
            />
          </IconCircle>
          <ShareOptionTitle>Save to disk</ShareOptionTitle>
          <ShareOptionDescription>
            Export the wiping sequence to a file from which you can import later
          </ShareOptionDescription>
          <ShareAction>
            <Button
              renderAs="button"
              layout="primary"
              label="Export file"
              isDisabled={isSaving()}
              onClick={handleExportFileClick}
            />
          </ShareAction>
        </ShareOption>
        <ShareOption>
          <IconCircle>
            <MaterialSymbol
              size={48}
              symbol="link"
            />
          </IconCircle>
          <ShareOptionTitle>Shareable link</ShareOptionTitle>
          <ShareOptionDescription>Get a read-only link that you can copy and share with others</ShareOptionDescription>
          <ShareAction>
            <Button
              renderAs="button"
              layout="primary"
              label="Get link"
              isDisabled={isSaving()}
              onClick={handleGetLinkClick}
            />
          </ShareAction>
        </ShareOption>
      </ContentWrapper>
    </Modal>
  );
}
