import { presetDefinitions } from 'WiperTool/domain/presets';
import { useCalibration, useSettings } from 'WiperTool/providers/AppModelProvider';
import { isClientRuntime } from 'lib/runtime';
import { createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { twc } from 'styles/helpers';
import { useDrawingPadBoundsWarning } from '../helpers';
import { PresetButton } from './PresetButton';
import { PresetsDropdownButton } from './PresetsDropdownButton';

const Container = twc(
  'div',
  `
    flex
    flex-col
    gap-1
  `,
);

const RowOuter = twc(
  'div',
  `
  w-full
  overflow-hidden
  flex
  justify-end
  items-center
  `,
);

const RowInner = twc(
  'div',
  `
  flex
  flex-row
  flex-nowrap
  items-center
  gap-3
  `,
);

const PresetButtonWrapper = twc(
  'div',
  `
  hidden
  sm:block
  `,
);

const PresetsLabel = twc(
  'div',
  `
  hidden
  sm:block
  `,
  {
    variants: {
      isDisabled: {
        false: null,
        true: `
        text-shark-300
      `,
      },
    },
  },
);

const AvailabilityNotice = twc(
  'div',
  `
  text-xs
  text-right
  text-shark-300
  `,
);

const safetyPadding = 50;

export function PresetButtons() {
  const calibration = useCalibration();
  const settings = useSettings();

  const { drawingPadBoundsWarning } = useDrawingPadBoundsWarning();

  const isDisabled = createMemo(
    () => !calibration.isComplete() || !settings.isComplete() || drawingPadBoundsWarning().kind !== 'none',
  );
  const totalPresets = presetDefinitions.length;
  const defaultVisibleCount = Math.max(0, totalPresets - 1);
  const [visibleCount, setVisibleCount] = createSignal(defaultVisibleCount);

  let outerRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let rafId: number | null = null;
  let lastRequestedCount = defaultVisibleCount;

  const fitPresets = (count = defaultVisibleCount) => {
    if (!isClientRuntime) {
      return;
    }

    if (count === lastRequestedCount && rafId !== null) {
      return;
    }

    lastRequestedCount = count;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }

    setVisibleCount(count);

    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      if (!outerRef || !containerRef) {
        return;
      }

      const outerWidth = Math.round(outerRef.getBoundingClientRect().width);
      const innerWidth = Math.round(containerRef.getBoundingClientRect().width) + safetyPadding;
      if (innerWidth > outerWidth && count > 0) {
        fitPresets(count - 1);
      }
    });
  };

  onMount(() => {
    if (!isClientRuntime) {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      fitPresets();
    });

    if (outerRef) {
      resizeObserver.observe(outerRef);
    }
    fitPresets();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
  });

  return (
    <Container>
      <RowOuter
        ref={(el) => {
          outerRef = el;
        }}
      >
        <RowInner
          ref={(el) => {
            containerRef = el;
          }}
        >
          <PresetsLabel isDisabled={isDisabled()}>Presets:</PresetsLabel>
          {presetDefinitions.slice(0, visibleCount()).map((preset) => (
            <PresetButtonWrapper>
              <PresetButton
                presetKey={preset.key}
                label={preset.label}
                isDisabled={isDisabled()}
              />
            </PresetButtonWrapper>
          ))}
          <PresetsDropdownButton
            layout="secondary"
            isDisabled={isDisabled()}
          />
        </RowInner>
      </RowOuter>
      {isDisabled() && (
        <AvailabilityNotice>
          Presets are only available when the full silicone pad is within reach of the nozzle.
        </AvailabilityNotice>
      )}
    </Container>
  );
}
