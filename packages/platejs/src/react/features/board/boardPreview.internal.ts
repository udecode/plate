import type { BoardGeo, BoardPlace } from '../../../features/board/lib';
import { BOARD_GEO_DEFAULT } from '../../../features/board/lib/boardShape.internal';
import type { BoardBox } from './boardIndex.internal';
import type { BoardGuide } from './boardSnap.internal';
import type { BoardPlaceTool } from './boardView.internal';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const elementOf = (host: HTMLElement, id: string) =>
  host.querySelector<HTMLElement>(`[data-board-shape="${CSS.escape(id)}"]`);

export const placeElement = (element: HTMLElement, box: BoardBox) => {
  element.style.left = `${box.x}px`;
  element.style.top = `${box.y}px`;
  element.style.width = `${box.width}px`;
  element.style.height = `${box.height}px`;
};

/**
 * A copy of `shape` that a copy drag shows in `layer` at paint rank `rank`:
 * no handles, no editor attributes, and no input.
 */
export const previewCopy = (
  shape: HTMLElement,
  layer: HTMLElement | null,
  rank: number
) => {
  const preview = shape.cloneNode(true) as HTMLElement;

  for (const handle of preview.querySelectorAll('[data-board-handle]')) {
    handle.remove();
  }
  for (const node of [preview, ...preview.querySelectorAll('*')]) {
    for (const { name } of [...node.attributes]) {
      if (
        name === 'contenteditable' ||
        name === 'data-board-shape' ||
        name.startsWith('data-editor')
      ) {
        node.removeAttribute(name);
      }
    }
  }
  preview.inert = true;
  preview.setAttribute('aria-hidden', 'true');
  preview.setAttribute('data-board-copy-preview', '');
  preview.setAttribute('data-editor-root-chrome-ignore', 'true');
  preview.style.pointerEvents = 'none';
  preview.style.zIndex = String(rank);
  layer?.append(preview);

  return preview;
};

const previewSvg = (layer: HTMLElement | null, name: string, rank: number) => {
  const svg = (layer?.ownerDocument ?? document).createElementNS(SVG_NS, 'svg');

  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute(name, '');
  svg.setAttribute('data-editor-root-chrome-ignore', 'true');
  svg.setAttribute('height', '1');
  svg.setAttribute('width', '1');
  Object.assign(svg.style, {
    left: '0',
    overflow: 'visible',
    pointerEvents: 'none',
    position: 'absolute',
    top: '0',
    zIndex: String(rank),
  });
  layer?.append(svg);

  return svg;
};

/** The line an arrow drag shows in `layer` from board point `from`. */
export const previewArrowLine = (
  layer: HTMLElement | null,
  from: BoardPlace,
  rank: number
) => {
  const svg = previewSvg(layer, 'data-board-arrow-preview', rank);
  const line = svg.ownerDocument.createElementNS(SVG_NS, 'line');

  for (const [name, value] of [
    ['stroke', 'currentColor'],
    ['stroke-width', '2'],
    ['x1', from.x],
    ['x2', from.x],
    ['y1', from.y],
    ['y2', from.y],
  ] as const) {
    line.setAttribute(name, String(value));
  }
  svg.append(line);

  return line;
};

export const previewArrowMark = (line: SVGLineElement, at: BoardPlace) => {
  const mark = line.ownerDocument.createElementNS(SVG_NS, 'circle');

  for (const [name, value] of [
    ['cx', at.x],
    ['cy', at.y],
    ['fill', 'currentColor'],
    ['r', '4'],
  ] as const) {
    mark.setAttribute(name, String(value));
  }
  line.after(mark);

  return mark;
};

const previewOutline = (
  layer: HTMLElement | null,
  name: string,
  value: string,
  from: BoardPlace,
  rank: number,
  style?: Readonly<{ background?: string; border: string }>
) => {
  const outline = (layer?.ownerDocument ?? document).createElement('div');

  outline.setAttribute('aria-hidden', 'true');
  outline.setAttribute(name, value);
  outline.setAttribute('data-editor-root-chrome-ignore', 'true');
  Object.assign(outline.style, {
    ...style,
    boxSizing: 'border-box',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: String(rank),
  });
  placeElement(outline, { ...from, height: 0, width: 0 });
  layer?.append(outline);

  return outline;
};

const SHAPE_OUTLINES: Readonly<
  Record<BoardGeo, readonly [string, Readonly<Record<string, string>>]>
> = {
  diamond: ['polygon', { points: '50,0 100,50 50,100 0,50' }],
  ellipse: ['ellipse', { cx: '50', cy: '50', rx: '50', ry: '50' }],
  rectangle: ['rect', { height: '100', width: '100' }],
  triangle: ['polygon', { points: '50,0 100,100 0,100' }],
};

const previewShapeOutline = (
  layer: HTMLElement | null,
  from: BoardPlace,
  rank: number,
  kind: BoardGeo | 'note'
) => {
  const outline = previewOutline(
    layer,
    'data-board-shape-preview',
    kind,
    from,
    rank
  );
  const { ownerDocument } = outline;
  const svg = ownerDocument.createElementNS(SVG_NS, 'svg');
  const [tag, attributes] =
    SHAPE_OUTLINES[kind === 'note' ? 'rectangle' : kind];
  const shape = ownerDocument.createElementNS(SVG_NS, tag);

  for (const [name, value] of [
    ['fill', 'none'],
    ['height', '100%'],
    ['preserveAspectRatio', 'none'],
    ['stroke', 'currentColor'],
    ['stroke-width', '2'],
    ['viewBox', '0 0 100 100'],
    ['width', '100%'],
  ] as const) {
    svg.setAttribute(name, value);
  }
  svg.style.display = 'block';
  svg.style.overflow = 'visible';
  for (const [name, value] of Object.entries(attributes)) {
    shape.setAttribute(name, value);
  }
  shape.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(shape);
  outline.append(svg);

  return outline;
};

export const previewPlaceOutline = (
  layer: HTMLElement | null,
  from: BoardPlace,
  rank: number,
  tool: BoardPlaceTool,
  geo: BoardGeo = BOARD_GEO_DEFAULT
) => {
  if (tool === 'frame') {
    return previewOutline(layer, 'data-board-frame-preview', '', from, rank, {
      border: '1px dashed currentColor',
    });
  }

  return previewShapeOutline(layer, from, rank, tool === 'note' ? tool : geo);
};

/** The box a selection drag shows in `layer` from board point `from`. */
export const previewSelectBox = (
  layer: HTMLElement | null,
  from: BoardPlace,
  rank: number
) =>
  previewOutline(layer, 'data-board-select-box', '', from, rank, {
    background: 'color-mix(in oklab, currentColor 8%, transparent)',
    border: '1px solid currentColor',
  });

export const previewGuides = (layer: HTMLElement | null, rank: number) =>
  previewSvg(layer, 'data-board-guides', rank);

export const drawGuides = (
  svg: SVGSVGElement,
  guides: readonly BoardGuide[],
  zoom: number
) => {
  const tick = 4 / zoom;

  svg.replaceChildren(
    ...guides.map(({ from, gap, to }) => {
      const mark = svg.ownerDocument.createElementNS(
        SVG_NS,
        gap ? 'path' : 'line'
      );
      const across = from.y === to.y ? { x: 0, y: tick } : { x: tick, y: 0 };
      const ticked = ({ x, y }: BoardPlace) =>
        `M${x - across.x} ${y - across.y}L${x + across.x} ${y + across.y}`;
      const shape: Record<string, number | string> = gap
        ? {
            d: `${ticked(from)}M${from.x} ${from.y}L${to.x} ${to.y}${ticked(to)}`,
            fill: 'none',
          }
        : { x1: from.x, x2: to.x, y1: from.y, y2: to.y };

      for (const [name, value] of Object.entries({
        stroke: 'currentColor',
        'stroke-width': 1 / zoom,
        ...shape,
      })) {
        mark.setAttribute(name, String(value));
      }

      return mark;
    })
  );
};

/** The line a pen drag shows in `layer`, drawn in board coordinates. */
export const previewStroke = (layer: HTMLElement | null, rank: number) => {
  const svg = previewSvg(layer, 'data-board-stroke-preview', rank);
  const path = svg.ownerDocument.createElementNS(SVG_NS, 'path');

  path.setAttribute('fill', 'currentColor');
  svg.append(path);

  return path;
};
