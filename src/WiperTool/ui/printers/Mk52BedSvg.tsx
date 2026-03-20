/** biome-ignore-all lint/a11y/noSvgWithoutTitle: no title */

import type { JSX } from 'solid-js';
import { lazy, Suspense } from 'solid-js';

const Decoration = lazy(() => import('./Mk52BedSvgDecoration').then((m) => ({ default: m.Mk52BedSvgDecoration })));

type Props = JSX.SvgSVGAttributes<SVGSVGElement>;

export function Mk52BedSvg(props: Props) {
  return (
    <svg
      viewBox="0 0 254 256"
      {...props}
    >
      <path
        fill="#393b3e"
        d="M0 25 25 0h12l6 6h168l6-6h12l25 25v221l-4 4h-41l-6 6h-12l-6-6H69l-6 6H51l-6-6H4l-4-4z"
      />
      <g
        class="fill-shark-300"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          class="stroke-shark-300"
          stroke-width=".5"
          d="m54.98 247.577-3 3M61.98 250.577l-3-3M194.98 247.577l-3 3M201.98 250.577l-3-3"
        />

        <Suspense>
          <Decoration />
        </Suspense>
      </g>
    </svg>
  );
}
