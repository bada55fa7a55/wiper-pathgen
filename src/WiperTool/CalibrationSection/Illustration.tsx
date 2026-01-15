import { ModalPortal } from 'WiperTool/modals';
import { createSignal } from 'solid-js';
import { twc } from 'styles/helpers';

const Container = twc(
  'div',
  `
  flex
  flex-col
  gap-2

  cursor-pointer
  `,
);

const IllustrationImage = twc(
  'img',
  `
  block
  w-full
  h-auto
  rounded-sm
  
  transition-transform
  duration-200
  hover:scale-[1.01]
  `,
);

const IllustrationCaption = twc(
  'div',
  `
  text-xs
  text-center
  text-gray-400
  `,
);

const IllustrationModal = twc(
  'div',
  `
  flex
  flex-col
  items-center
  gap-3

  p-4
  max-h-[90vh]
  max-w-[min(92vw,1100px)]

  animate-in
  zoom-in-95
  duration-200
  `,
);

const ModalImage = twc(
  'img',
  `
  block
  max-h-[75vh]
  max-w-[90vw]
  w-auto
  rounded-sm
  `,
);

const ModalCaption = twc(
  'div',
  `
  text-sm
  text-center
  text-shark-200
  `,
);

type Props = {
  src: string;
  caption: string;
};

export function Illustration(props: Props) {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Container onClick={handleOpen}>
        <IllustrationImage
          src={props.src}
          loading="lazy"
          aria-haspopup="dialog"
          aria-expanded={isOpen()}
        />
        <IllustrationCaption>{props.caption}</IllustrationCaption>
      </Container>
      <ModalPortal
        isOpen={isOpen}
        onClose={handleClose}
      >
        <IllustrationModal
          role="dialog"
          aria-modal="true"
          aria-label={props.caption}
          onClick={handleClose}
        >
          <ModalImage src={props.src} />
          <ModalCaption>{props.caption}</ModalCaption>
        </IllustrationModal>
      </ModalPortal>
    </>
  );
}
