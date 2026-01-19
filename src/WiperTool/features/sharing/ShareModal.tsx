import { createSignal } from 'solid-js';
import toast from 'solid-toast';
import { Button, Link, MaterialSymbol, Modal } from '@/components';
import { twc } from '@/styles';
import { createShareFile, SHARE_FILE_EXTENSION } from '@/WiperTool/domain/sharing';
import { actionShareLinkModalOpenedEvent, actionWipingSequenceExportedEvent, track } from '@/WiperTool/lib/analytics';
import { useSettings, useTracking, useWipingSequence } from '@/WiperTool/providers/AppModelProvider';
import { useSaveFile } from './useSaveFile';

const Content = twc(
  'div',
  `
    flex
    flex-col
    gap-8
  `,
);

const ShareOptions = twc(
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpenShareLink: () => void;
  onOpenImport: () => void;
};

export function ShareModal(props: Props) {
  const settings = useSettings();
  const wipingSequence = useWipingSequence();
  const tracking = useTracking();

  const { saveFile } = useSaveFile();
  const [isSaving, setIsSaving] = createSignal(false);

  const handleGetLinkClick = () => {
    track(actionShareLinkModalOpenedEvent('share'));
    props.onOpenShareLink();
  };

  const handleExportFileClick = async () => {
    track(actionWipingSequenceExportedEvent('share', tracking.lastWipingSequenceWrite()));
    setIsSaving(true);
    const { blob, fileName } = createShareFile({
      padKey: settings.padType(),
      printerKey: settings.printer(),
      wipingSequence: wipingSequence.wipingSteps(),
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
        props.onClose();
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportClick = () => {
    props.onOpenImport();
  };

  return (
    <Modal
      title="Sharing Is Caring"
      footerContent="Files and links are private and are not saved on a server."
      isOpen={props.isOpen}
      withCloseButton
      onClose={props.onClose}
    >
      <Content>
        <p>
          Share your nozzle wiping sequence with others via link or as a file, or download it to your computer for your
          personal archive.
          <br />
          You can{' '}
          <Link
            layout="internal"
            onClick={handleImportClick}
          >
            import
          </Link>{' '}
          saved wiping sequences again later.
        </p>
        <ShareOptions>
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
            <ShareOptionDescription>
              Get a read-only link that you can copy and share with others
            </ShareOptionDescription>
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
        </ShareOptions>
      </Content>
    </Modal>
  );
}
