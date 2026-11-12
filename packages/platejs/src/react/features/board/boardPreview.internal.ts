import type { BoardPlace } from '../../../features/board/lib';
import type { BoardBox } from './boardIndex.internal';

const SVG_NS = 'http://www.w3.org/2000/svg';

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

/** The dashed outline a frame drag shows in `layer` from board point `from`. */
export const previewFrameOutline = (
  layer: HTMLElement | null,
  from: BoardPlace,
  rank: number
) => {
  const outline = (layer?.ownerDocument ?? document).createElement('div');

  outline.setAttribute('aria-hidden', 'true');
  outline.setAttribute('data-board-frame-preview', '');
  outline.setAttribute('data-editor-root-chrome-ignore', 'true');
  Object.assign(outline.style, {
    border: '1px dashed currentColor',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: String(rank),
  });
  placeElement(outline, { ...from, height: 0, width: 0 });
  layer?.append(outline);

  return outline;
};

/** The line a pen drag shows in `layer`, drawn in board coordinates. */
export const previewStroke = (layer: HTMLElement | null, rank: number) => {
  const svg = previewSvg(layer, 'data-board-stroke-preview', rank);
  const path = svg.ownerDocument.createElementNS(SVG_NS, 'path');

  path.setAttribute('fill', 'currentColor');
  svg.append(path);

  return path;
};
