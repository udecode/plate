import type { InkBrush, InkMark, InkSample } from '../../../features/ink/lib';
import { strokePolygon } from '../../../internal/penStroke.internal';
import type { InkPlaced } from './inkPlacement.internal';

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

type InkPath = Readonly<{
  dx: number;
  dy: number;
  halo: boolean;
  mark: InkMark;
  path: SVGPathElement;
}>;

const HALO = ['data-picked', 'stroke', 'stroke-opacity', 'stroke-width'];

export const createInkSurface = (into: SVGGElement) => {
  const outlines = new WeakMap<InkMark, string>();
  const paths = new Map<string, InkPath>();
  let hidden = false;
  let ink: InkPlaced['ink'] = [];
  let picked: readonly string[] = [];

  const outlineOf = (mark: InkMark) => {
    let outline = outlines.get(mark);

    if (outline === undefined) {
      outline = inkOutline(mark.samples, mark.brush);
      outlines.set(mark, outline);
    }

    return outline;
  };

  const draw = () => {
    const shown: SVGPathElement[] = [];
    const left = new Set(paths.keys());

    for (const { dx, dy, mark } of hidden ? [] : ink) {
      const { color, opacity, size } = mark.brush;
      const halo = picked.includes(mark.id);
      const kept = paths.get(mark.id);
      const inked = kept?.mark !== mark;
      const moved = kept?.dx !== dx || kept?.dy !== dy;
      const path =
        kept?.path ??
        into.ownerDocument.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );

      if (!kept) path.setAttribute('data-ink-mark', mark.id);
      if (inked) {
        path.setAttribute('d', outlineOf(mark));
        path.setAttribute('fill', color);
        path.setAttribute('opacity', String(opacity));
      }
      if (halo && (inked || !kept?.halo)) {
        path.setAttribute('data-picked', 'true');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-opacity', '0.35');
        path.setAttribute('stroke-width', String(size * 2));
      } else if (!halo && kept?.halo) {
        for (const name of HALO) path.removeAttribute(name);
      }
      if (moved) path.setAttribute('transform', `translate(${dx} ${dy})`);
      if (inked || moved || kept?.halo !== halo) {
        paths.set(mark.id, { dx, dy, halo, mark, path });
      }
      left.delete(mark.id);
      shown.push(path);
    }
    for (const id of left) {
      paths.get(id)?.path.remove();
      paths.delete(id);
    }

    let previous: SVGPathElement | null = null;

    for (const path of shown) {
      if (path.parentNode !== into || path.previousSibling !== previous) {
        if (previous) previous.after(path);
        else into.prepend(path);
      }
      previous = path;
    }
  };

  return {
    paint: (placed: InkPlaced['ink']) => {
      ink = placed;
      draw();
    },
    setLook: (nextHidden: boolean, nextPicked: readonly string[]) => {
      hidden = nextHidden;
      picked = nextPicked;
      draw();
    },
  };
};
