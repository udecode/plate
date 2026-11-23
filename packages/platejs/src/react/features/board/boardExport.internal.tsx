import * as React from 'react';

import { ElementApi } from '../../../core';
import { shapeIdOf } from '../../../features/board/lib/boardCopy.internal';
import type { BasePluginInput } from '../../../lib';
import {
  EditorStatic,
  type EditorStaticProps,
  renderStaticHtml,
} from '../../../static';
import { getStaticRootView } from '../../../static/internal/staticDocumentView';
import type { BoardBox } from './boardIndex.internal';
import type { BoardView } from './boardView.internal';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PADDING = 32;
const UNDRAWN_FILL = '#e4e4e7';

export type BoardPictureWarning = Readonly<{
  code: 'content-undrawn' | 'shape-undrawn';
  shapeId?: string;
}>;

export type BoardPictureSvg = Readonly<{
  height: number;
  svg: string;
  warnings: readonly BoardPictureWarning[];
  width: number;
}>;

type Drawing = Readonly<{ box: BoardBox; drawing: Element | null; id: string }>;

function PictureShapes({
  editor,
  root,
}: EditorStaticProps & Readonly<{ root: string }>) {
  const shapes = getStaticRootView(editor, root);
  const ids = shapes.read
    .children()
    .map((node) => (ElementApi.isElement(node) ? shapeIdOf(node) : ''));

  return (
    <div data-board-picture-shapes={JSON.stringify(ids)}>
      <EditorStatic editor={shapes} />
    </div>
  );
}

const boxIn = (drawing: Element): BoardBox => {
  const [x = 0, y = 0, width = 0, height = 0] = (
    drawing.getAttribute('data-board-box') ?? ''
  )
    .split(' ')
    .map(Number);

  return { height, width, x, y };
};

const offset = (value: string) => Number.parseFloat(value) || 0;

const stripEditor = (drawing: Element) => {
  for (const node of [drawing, ...drawing.querySelectorAll('*')]) {
    for (const { name } of [...node.attributes]) {
      if (name === 'contenteditable' || name.startsWith('data-editor')) {
        node.removeAttribute(name);
      }
    }
  }
};

const paintedIn = (drawing: Element, origin: DOMRect): BoardBox[] =>
  [drawing, ...drawing.querySelectorAll('*')].flatMap((node) => {
    const { height, left, top, width } = node.getBoundingClientRect();

    return width > 0 || height > 0
      ? [{ height, width, x: left - origin.left, y: top - origin.top }]
      : [];
  });

const edgesOf = (boxes: readonly BoardBox[]) => {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const { height, width, x, y } of boxes) {
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x + width);
    bottom = Math.max(bottom, y + height);
  }

  return { bottom, left, right, top };
};

const rectAt = (document: Document, box: BoardBox, fill: string) => {
  const rect = document.createElementNS(SVG_NS, 'rect');

  rect.setAttribute('fill', fill);
  rect.setAttribute('height', String(box.height));
  rect.setAttribute('width', String(box.width));
  rect.setAttribute('x', String(box.x));
  rect.setAttribute('y', String(box.y));

  return rect;
};

const groupOf = (document: Document, { box, drawing, id }: Drawing) => {
  const group = document.createElementNS(SVG_NS, 'g');

  group.setAttribute('data-board-picture', id);
  if (!drawing) {
    group.append(rectAt(document, box, UNDRAWN_FILL));

    return group;
  }
  for (const svg of drawing.querySelectorAll<SVGSVGElement>(':scope > svg')) {
    svg.setAttribute('x', String(box.x + offset(svg.style.left)));
    svg.setAttribute('y', String(box.y + offset(svg.style.top)));
    group.append(svg);
  }

  const label = drawing.querySelector<HTMLElement>(
    ':scope > [data-board-arrow-label]'
  );

  if (label) {
    const object = document.createElementNS(SVG_NS, 'foreignObject');

    object.setAttribute('height', '1');
    object.setAttribute('overflow', 'visible');
    object.setAttribute('width', '1');
    object.setAttribute('x', String(box.x + offset(label.style.left)));
    object.setAttribute('y', String(box.y + offset(label.style.top)));
    label.style.removeProperty('left');
    label.style.removeProperty('top');
    object.append(label);
    group.append(object);
  }

  return group;
};

export const drawBoardPicture = async (
  view: BoardView,
  kit: readonly BasePluginInput[]
): Promise<BoardPictureSvg | null> => {
  const source = view.pictureSource();

  if (!source) return null;

  const { editor, host, layouts, projection, root } = source;
  const { data, diagnostics } = await renderStaticHtml(editor, {
    component: PictureShapes,
    presentation: kit,
    props: { root },
    ...(projection && { projection }),
  });
  const document = host.ownerDocument;
  const template = document.createElement('template');

  template.innerHTML = data;

  const ids: string[] = JSON.parse(
    template.content
      .querySelector('[data-board-picture-shapes]')
      ?.getAttribute('data-board-picture-shapes') ?? '[]'
  );
  const tops = [
    ...template.content.querySelectorAll(
      `[data-editor-root="${CSS.escape(root)}"][data-editor-node="element"]`
    ),
  ].filter((node) => !node.getAttribute('data-editor-path')?.includes(','));
  const shown = new Map(ids.map((id, at) => [id, tops[at]]));
  const warnings: BoardPictureWarning[] = [];
  const drawings: Drawing[] = [];

  for (const { box, id } of layouts) {
    if (!shown.has(id)) continue;

    const drawing = shown.get(id);

    if (drawing?.getAttribute('data-board-picture') === id) {
      stripEditor(drawing);
      drawings.push({ box: boxIn(drawing), drawing, id });
    } else {
      warnings.push({ code: 'shape-undrawn', shapeId: id });
      drawings.push({ box, drawing: null, id });
    }
  }
  if (drawings.length === 0) return null;
  if (diagnostics.some(({ code }) => code === 'missing-static-presentation')) {
    warnings.push({ code: 'content-undrawn' });
  }

  host.append(...drawings.flatMap(({ drawing }) => drawing ?? []));

  const origin = host.getBoundingClientRect();
  const edges = edgesOf(
    drawings.flatMap(({ box, drawing }) => [
      box,
      ...(drawing ? paintedIn(drawing, origin) : []),
    ])
  );

  host.replaceChildren();

  const left = Math.floor(edges.left - PADDING);
  const top = Math.floor(edges.top - PADDING);
  const width = Math.max(1, Math.ceil(edges.right + PADDING) - left);
  const height = Math.max(1, Math.ceil(edges.bottom + PADDING) - top);
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.append(
    rectAt(document, { height, width, x: left, y: top }, '#ffffff'),
    ...drawings.map((drawing) => groupOf(document, drawing))
  );

  return {
    height,
    svg: new XMLSerializer().serializeToString(svg),
    warnings,
    width,
  };
};
