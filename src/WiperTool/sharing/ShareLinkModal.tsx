import { clearModals, closeModal, isModalOpen, ModalKey } from 'WiperTool/store';
import { Button, Modal } from 'components';
import { twc } from 'styles';

const ContentWrapper = twc(
  'div',
  `
  flex
  gap-8
  
  flex-col
  items-center
  `,
);

export function ShareLinkModal() {
  const handleCloseModal = () => {
    clearModals();
  };

  const handleBackClick = () => {
    closeModal();
  };

  return (
    <Modal
      title="Share Link"
      footerContent="Links are private and are not saved on a server."
      isOpen={isModalOpen(ModalKey.ShareLink)}
      onClose={handleCloseModal}
    >
      <ContentWrapper>
        <div>Hello this is link sharing</div>
        <Button
          renderAs="button"
          layout="secondary"
          label="Back"
          onClick={handleBackClick}
        />
      </ContentWrapper>
    </Modal>
  );
}
