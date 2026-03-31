import { createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { Button, CodeTextArea } from '@/components';
import { twc } from '@/styles/helpers';
import { generateWipingSequenceGCode, serializeGCode } from '@/WiperTool/domain/gcode';
import { getWipingStepPoints } from '@/WiperTool/domain/wipingSequence';
import { calibrationValuesUsedEvent, gCodeCopiedEvent, settingsUsedEvent, track } from '@/WiperTool/lib/analytics';
import {
  useCalibration,
  usePads,
  usePrinters,
  useSettings,
  useTracking,
  useWipingSequence,
} from '@/WiperTool/providers/AppModelProvider';

const Container = twc(
  'div',
  `
  flex
  flex-col
  gap-3
  min-h-96
  lg:h-full
  p-4
  bg-zinc-800
  backdrop-blur
  border
  border-zinc-700/50
  rounded-xl
  `,
);

const TitleRow = twc(
  'div',
  `
  flex
  justify-between
  items-center
  `,
);

const Title = twc(
  'h3',
  `
  text-lg
  font-semibold
  text-white
  `,
);

const CopyRow = twc(
  'div',
  `
  flex
  items-center
  gap-3
  `,
);

export function GCode() {
  const calibration = useCalibration();
  const settings = useSettings();
  const wipingSequence = useWipingSequence();
  const tracking = useTracking();
  const { selectedPrinter } = usePrinters();
  const { selectedPadTopRight } = usePads();

  const [copied, setCopied] = createSignal(false);
  let copyTimeout: number | undefined;

  const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence.wipingSteps()));
  const gcode = createMemo(() => {
    const feedRate = settings.feedRate();
    const plungeDepth = settings.plungeDepth();
    const zLift = settings.zLift();
    const x = calibration.x();
    const y = calibration.y();
    const z = calibration.z();

    if (
      sequencePoints().length < 2 ||
      x === undefined ||
      y === undefined ||
      z === undefined ||
      feedRate === undefined ||
      plungeDepth === undefined ||
      zLift === undefined
    ) {
      return null;
    }

    const gCode = generateWipingSequenceGCode({
      printerName: selectedPrinter().name,
      printerOriginalCleaningGcode: selectedPrinter().originalCleaningGCode,
      padRef: {
        x,
        y,
        z,
      },
      wipingSequence: wipingSequence.wipingSteps(),
      padTopRight: { ...selectedPadTopRight(), z },
      feedRate,
      plungeDepth,
      zLift,
    });

    if (!gCode) {
      return null;
    }

    return serializeGCode(gCode).join('\n');
  });

  const showCopied = () => {
    setCopied(true);
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    copyTimeout = window.setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyGCodeClick = () => {
    navigator.clipboard.writeText(gcode() ?? '');
    showCopied();
    track(gCodeCopiedEvent(tracking.lastWipingSequenceWrite()));
    track(
      calibrationValuesUsedEvent('gcode', selectedPrinter().key, calibration.x(), calibration.y(), calibration.z()),
    );
    track(
      settingsUsedEvent('gcode', selectedPrinter().key, settings.feedRate(), settings.plungeDepth(), settings.zLift()),
    );
  };

  onCleanup(() => {
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
  });

  return (
    <Container>
      <TitleRow>
        <Title>G-Code</Title>
        <CopyRow>
          <Show when={copied()}>
            <span class="text-emerald-300 text-sm">Copied!</span>
          </Show>
          <Button
            renderAs="button"
            layout="primary"
            label="Copy G-code"
            msIcon="content_copy"
            status={copied() ? 'success' : undefined}
            isDisabled={copied() || !gcode()}
            onClick={handleCopyGCodeClick}
          />
        </CopyRow>
      </TitleRow>
      <CodeTextArea
        readOnly
        value={gcode() ?? 'Add at least two points to generate G-code'}
      />
    </Container>
  );
}
