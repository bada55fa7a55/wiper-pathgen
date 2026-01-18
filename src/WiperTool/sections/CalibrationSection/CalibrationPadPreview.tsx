import { useCalibration, usePads, usePrinters } from 'WiperTool/providers/AppModelProvider';
import { ModalPortal } from 'WiperTool/ui/modals';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { twc } from 'styles/helpers';

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

function CalibrationPadPreviewImpl() {
  const calibration = useCalibration();
  const { selectedPrinter } = usePrinters();
  const { selectedPad, selectedPadTopRight } = usePads();

  const hasCalibration = createMemo(() => calibration.x() !== undefined && calibration.y() !== undefined);

  const viewSettings = createMemo(() => {
    const printerData = selectedPrinter();
    const width = Math.max(1, printerData.maxX - printerData.minX) + 2 * padding;
    const height = Math.max(1, printerData.maxY - printerData.minY) + 2 * padding;
    return {
      width,
      height,
      minX: printerData.minX - padding,
      minY: printerData.minY - padding,
    };
  });

  const printerRect = createMemo<SvgRect>(() => {
    const printerData = selectedPrinter();
    const width = Math.max(1, printerData.maxX - printerData.minX);
    const height = Math.max(1, printerData.maxY - printerData.minY);

    return {
      x: printerData.minX,
      y: printerData.minY,
      width,
      height,
    };
  });

  const padRect = createMemo<SvgRect | null>(() => {
    if (!hasCalibration()) {
      return null;
    }

    const padData = selectedPad();
    const padTopRightPoint = selectedPadTopRight();

    const left = padTopRightPoint.x - padData.width;
    const top = padTopRightPoint.y;

    return {
      x: left,
      y: top - padData.height,
      width: Math.max(1, padData.width),
      height: Math.max(1, padData.height),
    };
  });

  const flipTransform = createMemo(() => {
    const { minY, height } = viewSettings();
    return `translate(0 ${minY * 2 + height + 10000}) scale(1 -1)`;
  });

  return (
    <SvgFrame>
      <Svg
        viewBox={`${viewSettings().minX} ${viewSettings().minY} ${viewSettings().width} ${viewSettings().height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          'aspect-ratio': `${viewSettings().width} / ${viewSettings().height}`,
          'max-height': 'min(70vh, 90vw)',
        }}
        role="img"
        aria-label="Printer bounds with silicone pad position"
      >
        <g transform={flipTransform()}>
          <rect
            x={viewSettings().minX}
            y={viewSettings().minY}
            width={viewSettings().width}
            height={viewSettings().height}
            rx="10"
            fill="none"
            stroke="none"
            vector-effect="non-scaling-stroke"
          />
          <rect
            class="stroke-orange-400"
            x={printerRect().x}
            y={printerRect().y}
            width={printerRect().width}
            height={printerRect().height}
            rx="2000"
            fill="none"
            stroke-width="1"
            stroke-dasharray="5, 3"
            vector-effect="non-scaling-stroke"
          />
          <Show when={selectedPrinter().bedShape}>
            {(bedShape) => (
              <g transform={`translate(${bedShape().offset[0]}, ${bedShape().offset[1]})`}>
                <path
                  class="fill-neutral-500"
                  opacity="0.4"
                  d={`M ${bedShape()
                    .path.map(([x, y]) => `${x} ${y}`)
                    .join(' L ')}`}
                />
                <For each={bedShape().negativeVolumes}>
                  {(negativeVolume) => (
                    <circle
                      cx={negativeVolume.x}
                      cy={negativeVolume.y}
                      r={negativeVolume.radius}
                      class="fill-neutral-800"
                    />
                  )}
                </For>
              </g>
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
          <div>Printer bounds</div>
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
