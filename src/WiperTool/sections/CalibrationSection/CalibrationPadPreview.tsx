import { createMemo, createSignal, Show } from 'solid-js';
import { twc } from '@/styles/helpers';
import { usePads, usePrinters } from '@/WiperTool/providers/AppModelProvider';
import { ModalPortal } from '@/WiperTool/ui/modals';
import { bedImages } from '@/WiperTool/ui/printers';

const Container = twc(
  'div',
  `
  flex
  flex-col
  gap-2

  cursor-pointer
  hover:scale-[1.01]
  `,
);

const ModalContainer = twc(
  'div',
  `
  flex
  flex-col
  gap-2
  p-4
  w-full
  max-h-[90vh]
  max-w-[min(92vw,1100px)]

  animate-in
  zoom-in-95
  duration-200
  `,
);

const SvgFrame = twc(
  'div',
  `
  flex
  flex-col
  gap-1
  w-full
  rounded-xl
  bg-shark-700
  border
  border-zinc-700/70
  p-2
  `,
);

const Svg = twc(
  'svg',
  `
  block
  w-full
  h-auto
  `,
);

const Legend = twc(
  'div',
  `
  flex
  gap-4
  justify-center
  `,
);

const LegendRow = twc(
  'div',
  `
  flex
  gap-2
  items-center
  text-sm
  text-shark-300
  `,
);

const LegendIcon = twc(
  'div',
  `
    w-3
    h-3
    rounded-xs
  `,
  {
    variants: {
      layout: {
        pad: `
        bg-porange-600
        `,
        bounds: `
        border
        border-orange-400
        border-dashed
        `,
      },
    },
  },
);

type SvgRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const padding = 15000;

type Props = {
  withBuildVolume?: boolean;
};

function CalibrationPadPreviewImpl(props: Props) {
  const { selectedPrinter } = usePrinters();
  const { calibratedPadRect } = usePads();

  const bedImage = createMemo(() => {
    return bedImages[selectedPrinter().key];
  });

  const viewSettings = createMemo(() => {
    const printerData = selectedPrinter();

    const viewRect = printerData.bounds.clone();

    const img = bedImage();
    if (img) {
      viewRect.x = Math.min(viewRect.x, img.x);
      viewRect.y = Math.min(viewRect.y, img.y);
      viewRect.width = Math.max(viewRect.width, img.width);
      viewRect.height = Math.max(viewRect.height, img.height);
    }

    viewRect.x -= padding;
    viewRect.y -= padding;
    viewRect.width += 2 * padding;
    viewRect.height += 2 * padding;

    return viewRect;
  });

  const boundsRect = createMemo<SvgRect>(() => {
    return selectedPrinter().bounds.toJSON();
  });

  const buildVolume = createMemo(() => {
    if (!props.withBuildVolume) {
      return null;
    }

    return selectedPrinter().buildVolume;
  });

  const padRect = createMemo<SvgRect | null>(() => {
    const rect = calibratedPadRect();
    if (!rect) {
      return null;
    }
    return rect.toJSON();
  });

  const flipTransform = createMemo(() => {
    const { y, height } = viewSettings();
    return `translate(0 ${y * 2 + height}) scale(1 -1)`;
  });

  return (
    <SvgFrame>
      <Svg
        viewBox={`${viewSettings().x} ${viewSettings().y} ${viewSettings().width} ${viewSettings().height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          'aspect-ratio': `${viewSettings().width} / ${viewSettings().height}`,
          'max-height': 'min(70vh, 90vw)',
        }}
        role="img"
        aria-label="Printer bounds with silicone pad position"
      >
        <g transform={flipTransform()}>
          <Show when={bedImage()}>
            {(img) => {
              const Svg = img().Svg;
              return (
                <Svg
                  x={img().x}
                  y={img().y}
                  width={img().width}
                  height={img().height}
                  preserveAspectRatio="none"
                />
              );
            }}
          </Show>
          <rect
            x={viewSettings().x}
            y={viewSettings().y}
            width={viewSettings().width}
            height={viewSettings().height}
            rx="10"
            fill="none"
            stroke="none"
            vector-effect="non-scaling-stroke"
          />
          <rect
            class="stroke-orange-400"
            x={boundsRect().x}
            y={boundsRect().y}
            width={boundsRect().width}
            height={boundsRect().height}
            rx="2000"
            fill="none"
            stroke-width="1"
            stroke-dasharray="5, 3"
            vector-effect="non-scaling-stroke"
          />
          <Show when={buildVolume()}>
            {(volume) => (
              <rect
                class="stroke-porange-500"
                x={0}
                y={0}
                width={volume().x}
                height={volume().y}
                rx="500"
                fill="none"
                vector-effect="non-scaling-stroke"
              />
            )}
          </Show>
          <Show when={padRect()}>
            {(rect) => (
              <rect
                class="fill-porange-500"
                x={rect().x}
                y={rect().y}
                width={rect().width}
                height={rect().height}
                rx="500"
                stroke="none"
                vector-effect="non-scaling-stroke"
              />
            )}
          </Show>
        </g>
      </Svg>
      <Legend>
        <LegendRow>
          <LegendIcon layout="bounds" />
          <div>Printer limits</div>
        </LegendRow>
        <LegendRow>
          <LegendIcon layout="pad" />
          <div>Silicone pad</div>
        </LegendRow>
      </Legend>
    </SvgFrame>
  );
}

export function CalibrationPadPreview() {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Container
        aria-haspopup="dialog"
        aria-expanded={isOpen()}
        onClick={handleOpen}
      >
        <CalibrationPadPreviewImpl />
      </Container>
      <ModalPortal
        isOpen={isOpen}
        onClose={handleClose}
      >
        <ModalContainer
          role="dialog"
          aria-modal="true"
          onClick={handleClose}
        >
          <CalibrationPadPreviewImpl />
        </ModalContainer>
      </ModalPortal>
    </>
  );
}
