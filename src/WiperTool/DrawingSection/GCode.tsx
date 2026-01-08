import { gCodeCopiedEvent, track } from 'WiperTool/lib/analytics';
import { generateGCodeCommands } from 'WiperTool/lib/gcode';
import { calibration, getWipingStepPoints, padTopRight, printer, settings, wipingSequence } from 'WiperTool/store';
import { Button, CodeTextArea } from 'components';
import { createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { twc } from 'styles/helpers';

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
  const [copied, setCopied] = createSignal(false);
  let copyTimeout: number | undefined;

  const sequencePoints = createMemo(() => getWipingStepPoints(wipingSequence()));
  const gcode = createMemo(() => {
    if (
      sequencePoints().length < 2 ||
      calibration.x === undefined ||
      calibration.y === undefined ||
      calibration.z === undefined ||
      settings.feedRate === undefined ||
      settings.plungeDepth === undefined ||
      settings.zLift === undefined
    ) {
      return null;
    }
    return (
      generateGCodeCommands({
        printerName: printer().name,
        printerOriginalCleaningGcode: printer().originalCleaningGCode,
        padRef: {
          x: calibration.x,
          y: calibration.y,
          z: calibration.z,
        },
        wipingSequence: wipingSequence(),
        padTopRight: { ...padTopRight(), z: calibration.z },
        feedRate: settings.feedRate,
        plungeDepth: settings.plungeDepth,
        zLift: settings.zLift,
      })?.join('\n') || ''
    );
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
    track(gCodeCopiedEvent());
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
