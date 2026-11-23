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
const STYLES = [
  'align-items',
  'background-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-left-width',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'box-shadow',
  'box-sizing',
  'color',
  'display',
  'fill',
  'flex-direction',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'height',
  'justify-content',
  'left',
  'letter-spacing',
  'line-height',
  'list-style-type',
  'margin-bottom',
  'margin-inline-start',
  'margin-left',
  'margin-top',
  'opacity',
  'overflow',
  'overflow-wrap',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'position',
  'stroke',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-width',
  'text-align',
  'text-decoration-color',
  'text-decoration-line',
  'text-underline-offset',
  'top',
  'transform',
  'translate',
  'white-space',
  'width',
  'word-break',
];
const INHERITED = new Set([
  'color',
  'fill',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'line-height',
  'list-style-type',
  'overflow-wrap',
  'stroke',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-width',
  'text-align',
  'text-underline-offset',
  'white-space',
  'word-break',
]);
const ON_SCREEN_PLACEMENT = new Set(['left', 'position', 'top', 'translate']);
const COLOR = /(?:oklab|oklch|lab|lch|color)\([^()]*\)/gu;

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

const keyOf = (element: Element) =>
  `${element.namespaceURI} ${element.localName}`;

const sandboxOf = (document: Document, elements: readonly Element[]) => {
  const bare = new Map<string, Element>();
  const sandbox = document.createElement('div');
  const svg = document.createElementNS(SVG_NS, 'svg');

  for (const element of elements) {
    if (bare.has(keyOf(element))) continue;

    const svgTag = element.namespaceURI === SVG_NS;
    const tag = svgTag
      ? document.createElementNS(SVG_NS, element.localName)
      : document.createElement(element.localName);

    bare.set(keyOf(element), tag);
    (svgTag ? svg : sandbox).append(tag);
  }
  sandbox.append(svg);

  return { bare, sandbox };
};

const stylesOf = (
  elements: ReadonlyArray<HTMLElement | SVGElement>,
  bare: ReadonlyMap<string, Element>
) => {
  const defaults = new Map(
    [...bare].map(([key, tag]) => {
      const style = getComputedStyle(tag);

      return [key, STYLES.map((name) => style.getPropertyValue(name))];
    })
  );
  const computed = new Map(
    elements.map((element) => [element, getComputedStyle(element)])
  );

  return [...computed].map(([element, style]) => {
    const parent = element.parentElement && computed.get(element.parentElement);
    const base = defaults.get(keyOf(element));
    const values = STYLES.flatMap((name, at) => {
      const value = style.getPropertyValue(name);
      const kept = INHERITED.has(name)
        ? parent?.getPropertyValue(name) === value
        : base?.[at] === value;

      return value === '' || kept ? [] : [[name, value] as const];
    });

    return [element, values] as const;
  });
};

const srgbOf = (document: Document) => {
  const cache = new Map<string, string>();
  let paint: CanvasRenderingContext2D | null | undefined;

  return (value: string) =>
    value.replace(COLOR, (color) => {
      paint ??= document
        .createElement('canvas')
        .getContext('2d', { willReadFrequently: true });

      if (!paint) return color;

      let srgb = cache.get(color);

      if (srgb === undefined) {
        paint.clearRect(0, 0, 1, 1);
        paint.fillStyle = color;
        paint.fillRect(0, 0, 1, 1);

        const [r, g, b, a = 0] = paint.getImageData(0, 0, 1, 1).data;

        srgb = `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`;
        cache.set(color, srgb);
      }

      return srgb;
    });
};

const backgroundOf = (host: Element, srgb: (value: string) => string) => {
  const layers: Array<[number, number, number, number]> = [];

  for (
    let element: Element | null = host;
    element;
    element = element.parentElement
  ) {
    const [r = 0, g = 0, b = 0, a = 1] = srgb(
      getComputedStyle(element).backgroundColor
    )
      .match(/[\d.]+/gu)
      ?.map(Number) ?? [0, 0, 0, 0];

    if (a > 0) layers.unshift([r, g, b, a]);
    if (a >= 1) break;
  }

  let [red, green, blue] = [255, 255, 255];

  for (const [r, g, b, a] of layers) {
    red = r * a + red * (1 - a);
    green = g * a + green * (1 - a);
    blue = b * a + blue * (1 - a);
  }

  return `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
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

const unplace = (root: HTMLElement | SVGElement) => {
  for (const name of ON_SCREEN_PLACEMENT) root.style.removeProperty(name);
};

const groupOf = (
  document: Document,
  { box, drawing, id }: Drawing,
  labels: ReadonlyMap<Element, DOMRect>
) => {
  const group = document.createElementNS(SVG_NS, 'g');

  group.setAttribute('data-board-picture', id);
  if (!drawing) {
    group.append(rectAt(document, box, UNDRAWN_FILL));

    return group;
  }
  for (const svg of drawing.querySelectorAll<SVGSVGElement>(':scope > svg')) {
    svg.setAttribute('x', String(box.x + offset(svg.style.left)));
    svg.setAttribute('y', String(box.y + offset(svg.style.top)));
    unplace(svg);
    group.append(svg);
  }

  const label = drawing.querySelector<HTMLElement>(
    ':scope > [data-board-arrow-label]'
  );

  if (label) {
    const object = document.createElementNS(SVG_NS, 'foreignObject');
    const size = labels.get(label);
    const height = Math.max(1, Math.ceil(size?.height ?? 0));
    const width = Math.max(1, Math.ceil(size?.width ?? 0));

    object.setAttribute('height', String(height));
    object.setAttribute('overflow', 'visible');
    object.setAttribute('width', String(width));
    object.setAttribute(
      'x',
      String(box.x + offset(label.style.left) - width / 2)
    );
    object.setAttribute(
      'y',
      String(box.y + offset(label.style.top) - height / 2)
    );
    unplace(label);
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

  const placed = drawings.flatMap(({ drawing }) => [
    ...(drawing?.querySelectorAll<HTMLElement | SVGElement>(
      ':scope > svg, :scope > [data-board-arrow-label]'
    ) ?? []),
  ]);
  const elements = placed.flatMap((element) => [
    element,
    ...element.querySelectorAll<HTMLElement | SVGElement>('*'),
  ]);
  const { bare, sandbox } = sandboxOf(document, elements);

  host.append(...drawings.flatMap(({ drawing }) => drawing ?? []), sandbox);

  const origin = host.getBoundingClientRect();
  const edges = edgesOf(
    drawings.flatMap(({ box, drawing }) => [
      box,
      ...(drawing ? paintedIn(drawing, origin) : []),
    ])
  );
  const styles = stylesOf(elements, bare);
  const labels = new Map(
    placed
      .filter((element) => element.hasAttribute('data-board-arrow-label'))
      .map((label) => [label, label.getBoundingClientRect()])
  );
  const srgb = srgbOf(document);
  const background = backgroundOf(host, srgb);

  host.replaceChildren();
  // A node removed from the editor stays watched until its observer's next
  // delivery, so the styles wait for that delivery.
  await Promise.resolve();

  for (const [element, values] of styles) {
    for (const [name, value] of values) {
      element.style.setProperty(name, srgb(value));
    }
  }

  const left = Math.floor(edges.left - PADDING);
  const top = Math.floor(edges.top - PADDING);
  const width = Math.max(1, Math.ceil(edges.right + PADDING) - left);
  const height = Math.max(1, Math.ceil(edges.bottom + PADDING) - top);
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.append(
    rectAt(document, { height, width, x: left, y: top }, background),
    ...drawings.map((drawing) => groupOf(document, drawing, labels))
  );

  return {
    height,
    svg: new XMLSerializer().serializeToString(svg),
    warnings,
    width,
  };
};
