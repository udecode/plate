import type { InkBrush, InkSample } from '../../../features/ink/lib';
import { strokePolygon } from '../../internal/penStroke.internal';

// perfect-freehand draws a point's radius as size * (0.5 - thinning * (0.5 -
// pressure)), so a full-pressure point reaches size * (1 + thinning) / 2.
// Painting at brush.size / (1 + thinning) keeps that reach at brush.size / 2,
// the radius capture and placement test words against, while a pen still shows
// its pressure.
const INK_THINNING = 0.25;

/**
 * The SVG outline of a mark's samples in `brush`, moved by `dx` and `dy`.
 * `last` closes the line's end, for a finished mark.
 */
export const inkOutline = (
  samples: readonly InkSample[],
  brush: InkBrush,
  { dx = 0, dy = 0, last = true } = {}
) =>
  strokePolygon(
    samples.map(([x, y, pressure]) => [x + dx, y + dy, pressure] as const),
    { size: brush.size / (1 + INK_THINNING), thinning: INK_THINNING },
    last
  );
