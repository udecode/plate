import * as React from 'react';

import { type Element as EditorElement, ElementApi } from '../../../core';
import { createAuthoredEditorView } from '../../../facade';
import { BaseBoardPlugin } from '../../../features/board/lib';
import {
  arrowEndsOf,
  isBoundArrowEnd,
} from '../../../features/board/lib/boardArrow.internal';
import { shapeIdOf } from '../../../features/board/lib/boardCopy.internal';
import {
  type BoardPictureMeasuredSize,
  bindBoardPictureHeights,
  isAutoSizeBoardText,
} from '../../../features/board/lib/boardHeights.internal';
import {
  type BoardSize,
  isBoardSize,
} from '../../../features/board/lib/boardShape.internal';
import { boardTypesOf } from '../../../features/board/lib/boardTypes.internal';
import {
  type BasePluginInput,
  type Editor,
  getPluginNodeClass,
} from '../../../lib';
import { EditorStatic } from '../../../static';
import { loadStaticRenderer } from '../../../static/internal/renderStaticHtmlWithOverrides';
import { getStaticRootView } from '../../../static/internal/staticDocumentView';
import { bindStaticPresentation } from '../../../static/internal/staticPresentation';
import { type BoardBox, spanOf } from './boardIndex.internal';
import {
  PICTURE_ROOT,
  pictureFrameOf,
  pictureSheetOf,
  readPictureStyles,
} from './boardPictureStyles.internal';
import type {
  BoardPicture,
  BoardPictureOptions,
  BoardPictureWarning,
  BoardView,
} from './boardView.internal';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PADDING = 32;
const UNDRAWN_FILL = '#e4e4e7';
const PNG_SCALE = 2;
const PNG_SIDE = 16_384;
const PNG_AREA = 16_777_216;
const FETCHES = 6;
const FETCH_LIMIT_MS = 5000;
const FONT_WAIT_MS = 250;
const COLOR = /(?:oklab|oklch|lab|lch|color)\([^()]*\)/gu;
const QUOTED = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/u;

type Drawing = Readonly<{ box: BoardBox; drawing: Element | null; id: string }>;

function PictureShapes({ shapes }: Readonly<{ shapes: Editor }>) {
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

const inOrUnder = (element: Element, selector: string) =>
  element.matches(selector) || element.querySelector(selector) !== null;

const stripEditor = (drawing: Element) => {
  for (const node of [drawing, ...drawing.querySelectorAll('*')]) {
    for (const { name } of [...node.attributes]) {
      if (name === 'contenteditable' || name.startsWith('data-editor')) {
        node.removeAttribute(name);
      }
    }
  }
};

const srgbOf = (document: Document) => {
  const cache = new Map<string, string>();
  let paint: CanvasRenderingContext2D | null | undefined;

  const converted = (color: string) => {
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
  };

  // Generated text keeps its quoted words, such as content: "color(srgb 1 0 0)".
  return (value: string) =>
    value
      .split(QUOTED)
      .map((part, at) => (at % 2 === 1 ? part : part.replace(COLOR, converted)))
      .join('');
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

const paintedIn = (
  drawing: Element,
  origin: DOMRect,
  scaleX: number,
  scaleY: number
): BoardBox[] =>
  [drawing, ...drawing.querySelectorAll('*')].flatMap((node) => {
    const { height, left, top, width } = node.getBoundingClientRect();

    return width > 0 || height > 0
      ? [
          {
            height: height / scaleY,
            width: width / scaleX,
            x: (left - origin.left) / scaleX,
            y: (top - origin.top) / scaleY,
          },
        ]
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

const sourceOf = (image: Element) =>
  image.localName === 'img' ? 'src' : 'href';

const inSixes = async (tasks: ReadonlyArray<() => Promise<void>>) => {
  const queue = [...tasks];

  await Promise.all(
    Array.from({ length: FETCHES }, async () => {
      for (let task = queue.shift(); task; task = queue.shift()) {
        await task();
      }
    })
  );
};

const fetched = async (url: string) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_LIMIT_MS),
  });

  if (!response.ok) throw new Error(`${url} answered ${response.status}.`);

  return response.blob();
};

const dataUrlOf = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('The file did not read as a data URL.'))
    );
    reader.addEventListener('error', () =>
      reject(reader.error ?? new Error('The file did not read.'))
    );
    reader.readAsDataURL(blob);
  });

const decodedDataUrl = async (
  document: Document,
  blob: Blob,
  size: BoardSize,
  scale: number | null
) => {
  const url = URL.createObjectURL(blob);

  try {
    const image = document.createElement('img');

    image.src = url;
    await image.decode();

    const { naturalHeight, naturalWidth } = image;
    const fit =
      scale === null
        ? 1
        : scale *
          Math.max(size.width / naturalWidth, size.height / naturalHeight);
    const canvas = document.createElement('canvas');
    const paint = fit > 0 && fit < 1 ? canvas.getContext('2d') : null;

    if (!paint) return await dataUrlOf(blob);

    canvas.height = Math.max(1, Math.round(naturalHeight * fit));
    canvas.width = Math.max(1, Math.round(naturalWidth * fit));
    paint.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
};

const grayOf = (document: Document, image: HTMLElement | SVGElement) => {
  if (image.namespaceURI === SVG_NS) {
    const rect = document.createElementNS(SVG_NS, 'rect');

    for (const name of ['height', 'width', 'x', 'y']) {
      const value = image.getAttribute(name);

      if (value !== null) rect.setAttribute(name, value);
    }
    rect.setAttribute('fill', UNDRAWN_FILL);

    return rect;
  }

  const box = document.createElement('span');

  box.style.cssText = image.style.cssText;
  box.style.backgroundColor = UNDRAWN_FILL;
  box.style.display ||= 'inline-block';

  return box;
};

const pngSizeOf = (width: number, height: number) => {
  const scale = Math.min(
    PNG_SCALE,
    PNG_SIDE / width,
    PNG_SIDE / height,
    Math.sqrt(PNG_AREA / (width * height))
  );

  return {
    height: Math.max(1, Math.floor(height * scale)),
    scale,
    width: Math.max(1, Math.floor(width * scale)),
  };
};

const pngOf = async (
  document: Document,
  svg: string,
  { height, width }: Readonly<{ height: number; width: number }>
) => {
  const image = document.createElement('img');
  let fallback: string | undefined;

  try {
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode().catch(() => {
      fallback = URL.createObjectURL(
        new Blob([svg], { type: 'image/svg+xml' })
      );
      image.src = fallback;

      return image.decode();
    });
    // WebKit applies an SVG image's embedded fonts some time after decode()
    // resolves, so the canvas waits before it draws.
    await new Promise((resolve) => {
      setTimeout(resolve, FONT_WAIT_MS);
    });

    const canvas = document.createElement('canvas');

    canvas.height = height;
    canvas.width = width;

    const paint = canvas.getContext('2d');

    if (!paint) throw new Error('The browser gave no 2D canvas for the PNG.');

    paint.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('The PNG did not encode.')),
        'image/png'
      );
    });
  } finally {
    if (fallback) URL.revokeObjectURL(fallback);
  }
};

// WebKit paints positioned HTML inside a foreignObject from the picture's
// origin, past every x, y and transform of the svg around it, unless a fixed
// box inside the foreignObject holds that HTML.
const pin = (document: Document, object: Element) => {
  const box = document.createElement('div');
  const size = (name: 'height' | 'width') => {
    const value = Number(object.getAttribute(name));

    return Number.isFinite(value) && value > 0 ? `${value}px` : '100%';
  };

  box.style.cssText = `position: fixed; left: 0px; top: 0px; width: ${size('width')}; height: ${size('height')};`;
  box.append(...object.childNodes);
  object.append(box);
};

const groupOf = (
  document: Document,
  { box, drawing, id }: Drawing,
  labels: ReadonlyMap<Element, BoardSize>,
  offsets: ReadonlyMap<Element, Readonly<{ left: number; top: number }>>
) => {
  const group = document.createElementNS(SVG_NS, 'g');

  group.setAttribute('data-board-picture', id);
  if (!drawing) {
    group.append(rectAt(document, box, UNDRAWN_FILL));

    return group;
  }
  for (const svg of drawing.querySelectorAll<SVGSVGElement>(':scope > svg')) {
    svg.setAttribute('x', String(box.x + (offsets.get(svg)?.left ?? 0)));
    svg.setAttribute('y', String(box.y + (offsets.get(svg)?.top ?? 0)));
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
      String(box.x + (offsets.get(label)?.left ?? 0) - width / 2)
    );
    object.setAttribute(
      'y',
      String(box.y + (offsets.get(label)?.top ?? 0) - height / 2)
    );
    object.append(label);
    group.append(object);
  }
  for (const object of group.querySelectorAll('foreignObject')) {
    pin(document, object);
  }

  return group;
};

const OFF_PAGE = 'The board is not on the page.';
const CSS_TOKEN =
  /"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|\\.?|[(),;]|[^"'\\(),;]+/gsu;
const URL_SOURCE =
  /^url\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|((?:[^"'()\s\\]|\\.)*))\s*\)/isu;

const splitTopLevel = (text: string, separator: ',' | ';') => {
  const parts = [''];
  let depth = 0;

  for (const [token] of text.matchAll(CSS_TOKEN)) {
    if (token === '(') depth += 1;
    if (token === ')') depth = Math.max(0, depth - 1);
    if (token === separator && depth === 0) parts.push('');
    else parts[parts.length - 1] += token;
  }

  return parts;
};

const inlinedFace = async (face: string, base: string) => {
  const open = face.indexOf('{') + 1;
  const close = face.lastIndexOf('}');
  const declarations = splitTopLevel(face.slice(open, close), ';');
  const at = declarations.findIndex((declaration) =>
    /^\s*src\s*:/iu.test(declaration)
  );

  if (at === -1) return { css: face, missing: false };

  const colon = declarations[at].indexOf(':') + 1;
  const kept: string[] = [];
  let urls = 0;
  let loaded = 0;

  // A face's src is a priority list, and a browser uses the first source it
  // can load, which need not be the first one that downloads.
  for (const source of splitTopLevel(declarations[at].slice(colon), ',')) {
    const written = source.trim();
    const url = URL_SOURCE.exec(written);

    if (!url) {
      if (written) kept.push(written);
      continue;
    }
    urls += 1;
    try {
      const href = (url[1] ?? url[2] ?? url[3] ?? '').replaceAll(
        /\\(.)/gsu,
        '$1'
      );
      const inlined = /^data:/iu.test(href)
        ? href
        : await dataUrlOf(await fetched(new URL(href, base).href));

      kept.push(
        `url("${inlined.replaceAll(/["\\]/gu, '\\$&')}")${written.slice(url[0].length)}`
      );
      loaded += 1;
    } catch {
      continue;
    }
  }
  if (urls === 0) return { css: face, missing: false };
  declarations[at] = `${declarations[at].slice(0, colon)} ${kept.join(', ')}`;

  return {
    css:
      kept.length === 0
        ? ''
        : `${face.slice(0, open)}${declarations.join(';')}${face.slice(close)}`,
    missing: loaded === 0,
  };
};

const pageUrlOf = (href: string, base: string) =>
  URL.canParse(href, base) ? new URL(href, base) : null;

const pixelsOf = (value: string) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const SCALE_PROBE_PX = 1000;
const EMPTY_BOX: BoardBox = { height: 0, width: 0, x: 0, y: 0 };

const scaleProbeOf = (document: Document) => {
  const probe = document.createElement('div');

  probe.setAttribute(
    'style',
    `position: absolute; left: 0px; top: 0px; box-sizing: border-box; border: 0px; margin: 0px; padding: 0px; width: ${SCALE_PROBE_PX}px; height: ${SCALE_PROBE_PX}px; pointer-events: none; visibility: hidden;`
  );

  return probe;
};

const ownTextOf = (drawing: Element, root: string): Element | null => {
  for (const candidate of drawing.querySelectorAll('[data-board-text]')) {
    if (
      candidate.closest('[data-board-picture]') === drawing &&
      candidate
        .closest('[data-editor-root]')
        ?.getAttribute('data-editor-root') === root
    ) {
      return candidate;
    }
  }

  return null;
};

const measuredTextSize = (
  drawing: Element,
  root: string,
  scaleX: number,
  scaleY: number
): BoardSize | null => {
  const text = ownTextOf(drawing, root);

  if (!text) return null;

  const rect = text.getBoundingClientRect();
  const contentHeight = rect.height / scaleY;
  const contentWidth = rect.width / scaleX;

  if (!Number.isFinite(contentHeight) || !Number.isFinite(contentWidth)) {
    return null;
  }

  const card = text.parentElement;
  const viewWindow = card?.ownerDocument.defaultView ?? globalThis;
  const style = card ? viewWindow.getComputedStyle(card) : null;
  const verticalChrome = style
    ? pixelsOf(style.paddingTop) +
      pixelsOf(style.paddingBottom) +
      pixelsOf(style.borderTopWidth) +
      pixelsOf(style.borderBottomWidth)
    : 0;
  const horizontalChrome = style
    ? pixelsOf(style.paddingLeft) +
      pixelsOf(style.paddingRight) +
      pixelsOf(style.borderLeftWidth) +
      pixelsOf(style.borderRightWidth)
    : 0;

  return {
    height: contentHeight + verticalChrome,
    width: contentWidth + horizontalChrome,
  };
};

export const drawBoardPicture = async (
  view: Pick<BoardView, 'pictureSource'>,
  selected: readonly string[],
  format: BoardPictureOptions['format'],
  kit: readonly BasePluginInput[]
): Promise<BoardPicture | null> => {
  const { renderToStaticMarkup } = await loadStaticRenderer();
  const source = view.pictureSource(selected);

  if (!source) throw new Error(OFF_PAGE);

  const { editor, host, ids, projection, root } = source;
  const picture = createAuthoredEditorView(editor, {
    readOnly: true,
    ...(projection && { authored: { preview: projection } }),
  });
  const missing = bindStaticPresentation(picture, { plugins: kit });
  const shapes = getStaticRootView(picture, root);
  const types = boardTypesOf(picture);
  const noteType = types.note();
  const textType = types.text();
  const document = host.ownerDocument;
  const { baseURI } = document;
  const nodesById = new Map<string, EditorElement>();
  const storedBoxes = new Map<string, BoardBox>();
  const storedBoxOf = (id: string): BoardBox => {
    const cached = storedBoxes.get(id);

    if (cached) return cached;

    const boardRead = picture.plugin(BaseBoardPlugin).read;
    const entry = boardRead.shape(id);
    let box = EMPTY_BOX;

    if (entry?.kind === 'arrow') {
      const ends = boardRead.arrowEnds(id);

      if (ends) box = spanOf(ends);
    } else if (entry) {
      box = { ...entry.place, ...entry.size };
    }

    storedBoxes.set(id, box);

    return box;
  };
  const renderPass = () => {
    const data = renderToStaticMarkup(<PictureShapes shapes={shapes} />);
    const template = document.createElement('template');

    template.innerHTML = data;

    const kept = new Set<string>(
      JSON.parse(
        template.content
          .querySelector('[data-board-picture-shapes]')
          ?.getAttribute('data-board-picture-shapes') ?? '[]'
      )
    );
    const shown = new Map(
      [
        ...template.content.querySelectorAll(
          `[data-editor-root="${CSS.escape(root)}"][data-editor-node="element"]`
        ),
      ].flatMap((node) => {
        const id = node.getAttribute('data-board-picture');

        return id === null ||
          node.getAttribute('data-editor-path')?.includes(',')
          ? []
          : [[id, node] as const];
      })
    );
    const passWarnings: BoardPictureWarning[] = [];
    const passDrawings: Drawing[] = [];

    for (const id of ids) {
      if (!kept.has(id)) continue;

      const drawing = shown.get(id);

      if (drawing) {
        if (inOrUnder(drawing, '[data-board-image-unreadable]')) {
          passWarnings.push({ code: 'image-unreadable', shapeId: id });
        }
        passDrawings.push({ box: boxIn(drawing), drawing, id });
      } else {
        passWarnings.push({ code: 'shape-undrawn', shapeId: id });
        passDrawings.push({ box: storedBoxOf(id), drawing: null, id });
      }
    }

    return { drawings: passDrawings, shown, warnings: passWarnings };
  };

  const firstPass = renderPass();
  const { shown } = firstPass;
  let { drawings, warnings } = firstPass;

  if (drawings.length === 0) return null;

  for (const node of shapes.read.children()) {
    if (!ElementApi.isElement(node)) continue;

    const id = shapeIdOf(node);

    if (id) nodesById.set(id, node);
  }

  const drawnIds = new Set(drawings.map(({ id }) => id));
  const measureCandidates = new Map<
    string,
    Readonly<{ autoWidth: boolean; drawing: Element; storedSize: BoardSize }>
  >();
  const extraTargets: Element[] = [];
  const considerText = (id: string, drawing: Element, extra: boolean) => {
    if (measureCandidates.has(id)) return;

    const node = nodesById.get(id);

    if (
      !node ||
      (node.type !== noteType &&
        (textType === undefined || node.type !== textType))
    ) {
      return;
    }

    const box = boxIn(drawing);
    const storedSize = isBoardSize(node.size)
      ? node.size
      : { height: box.height, width: box.width };

    measureCandidates.set(id, {
      autoWidth: isAutoSizeBoardText(node, textType),
      drawing,
      storedSize,
    });
    if (extra) extraTargets.push(drawing);
  };

  for (const { drawing, id } of drawings) {
    if (!drawing) continue;

    const node = nodesById.get(id);

    if (!node) continue;

    const arrow = arrowEndsOf(node);

    if (arrow) {
      for (const end of [arrow.start, arrow.end]) {
        if (!isBoundArrowEnd(end) || drawnIds.has(end.shape)) continue;

        const targetDrawing = shown.get(end.shape);

        if (targetDrawing) considerText(end.shape, targetDrawing, true);
      }
    } else {
      considerText(id, drawing, false);
    }
  }

  const srgb = srgbOf(document);
  const { background, edges, images, labels, placed, styles } = (() => {
    let frame = pictureFrameOf(document);
    const probe = scaleProbeOf(document);

    try {
      host.append(probe);
      const probed = probe.getBoundingClientRect();
      const scaleX =
        Number.isFinite(probed.width) && probed.width > 0
          ? probed.width / SCALE_PROBE_PX
          : 1;
      const scaleY =
        Number.isFinite(probed.height) && probed.height > 0
          ? probed.height / SCALE_PROBE_PX
          : 1;

      probe.remove();
      host.append(
        ...drawings.flatMap(({ drawing }) => drawing ?? []),
        frame,
        ...extraTargets
      );

      const grownSizes = new Map<string, BoardPictureMeasuredSize>();

      for (const [
        id,
        { autoWidth, drawing, storedSize },
      ] of measureCandidates) {
        const measured = measuredTextSize(drawing, root, scaleX, scaleY);

        if (!measured) continue;

        const height =
          measured.height > storedSize.height ? measured.height : undefined;
        const width =
          autoWidth && measured.width > storedSize.width
            ? Math.ceil(measured.width)
            : undefined;

        if (height !== undefined || width !== undefined) {
          grownSizes.set(id, {
            ...(height !== undefined ? { height } : {}),
            ...(width !== undefined ? { width } : {}),
          });
        }
      }

      if (grownSizes.size > 0) {
        host.replaceChildren();
        bindBoardPictureHeights(shapes, grownSizes);
        ({ drawings, warnings } = renderPass());
        frame = pictureFrameOf(document);
        host.append(...drawings.flatMap(({ drawing }) => drawing ?? []), frame);
      } else {
        for (const extra of extraTargets) extra.remove();
      }

      if (
        [...missing].some(([name, features]) =>
          drawings.some(
            ({ drawing }) =>
              drawing &&
              (features.has('slots') ||
                inOrUnder(drawing, `.${CSS.escape(getPluginNodeClass(name))}`))
          )
        )
      ) {
        warnings.push({ code: 'content-undrawn' });
      }

      const elements = drawings.flatMap(({ drawing }) => [
        ...(drawing?.querySelectorAll<HTMLElement | SVGElement>(
          ':scope > svg, :scope > [data-board-arrow-label]'
        ) ?? []),
      ]);
      const origin = host.getBoundingClientRect();

      return {
        background: backgroundOf(host, srgb),
        edges: edgesOf(
          drawings.flatMap(({ box, drawing }) => [
            box,
            ...(drawing ? paintedIn(drawing, origin, scaleX, scaleY) : []),
          ])
        ),
        images: elements.flatMap((drawn) =>
          [...drawn.querySelectorAll<HTMLElement | SVGElement>('image, img')]
            .filter((image) => image.getAttribute(sourceOf(image)))
            .map((image) => {
              const rect = image.getBoundingClientRect();

              return {
                id:
                  image
                    .closest('[data-board-picture]')
                    ?.getAttribute('data-board-picture') ?? '',
                image,
                size: {
                  height: rect.height / scaleY,
                  width: rect.width / scaleX,
                },
              };
            })
        ),
        labels: new Map(
          elements
            .filter((element) => element.hasAttribute('data-board-arrow-label'))
            .map((label) => {
              const rect = label.getBoundingClientRect();

              return [
                label,
                { height: rect.height / scaleY, width: rect.width / scaleX },
              ] as const;
            })
        ),
        placed: elements,
        styles: readPictureStyles(frame, host, elements),
      };
    } finally {
      host.replaceChildren();
    }
  })();
  // A node removed from the editor stays watched until its observer's next
  // delivery, so the attribute removal and the styles wait for that delivery.
  // The reads came first because a page style sheet can match the editor's
  // attributes.
  await Promise.resolve();

  for (const { drawing } of drawings) {
    if (drawing) stripEditor(drawing);
  }
  for (const link of placed.flatMap((drawn) => [
    ...drawn.querySelectorAll('a[href]'),
  ])) {
    const url = pageUrlOf(link.getAttribute('href') ?? '', baseURI);

    if (url) link.setAttribute('href', url.href);
  }

  const nonce = Math.random().toString(36).slice(2, 10);
  const rules = styles.write(srgb, nonce);

  const left = Math.floor(edges.left - PADDING);
  const top = Math.floor(edges.top - PADDING);
  const width = Math.max(1, Math.ceil(edges.right + PADDING) - left);
  const height = Math.max(1, Math.ceil(edges.bottom + PADDING) - top);
  const png = format === 'png' ? pngSizeOf(width, height) : null;
  const css: string[] = [];
  let fontMissing = false;

  await inSixes([
    ...images.map(({ id, image, size }) => async () => {
      const name = sourceOf(image);
      const href = image.getAttribute(name) ?? '';

      try {
        const blob = await fetched(new URL(href, baseURI).href);

        image.setAttribute(
          name,
          await decodedDataUrl(document, blob, size, png?.scale ?? null)
        );
      } catch {
        const link = pageUrlOf(href, baseURI);

        warnings.push({ code: 'image-unreadable', shapeId: id });
        if (!png && link && /^https?:$/u.test(link.protocol)) {
          image.setAttribute(name, link.href);
        } else {
          image.replaceWith(grayOf(document, image));
        }
      }
    }),
    ...styles.faces.map(({ base, css: face }, at) => async () => {
      const inlined = await inlinedFace(face, base);

      if (inlined.missing) fontMissing = true;
      css[at] = inlined.css;
    }),
  ]);
  if (fontMissing) warnings.push({ code: 'font-missing' });

  const svg = document.createElementNS(SVG_NS, 'svg');
  const sheet = document.createElementNS(SVG_NS, 'style');

  sheet.textContent = pictureSheetOf(nonce, css, rules);
  svg.setAttribute(PICTURE_ROOT, nonce);
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.append(
    sheet,
    rectAt(document, { height, width, x: left, y: top }, background),
    ...drawings.map((drawing) =>
      groupOf(document, drawing, labels, styles.offsets)
    )
  );

  const text = new XMLSerializer().serializeToString(svg);

  if (png && png.scale < PNG_SCALE) warnings.push({ code: 'downscaled' });

  const blob = png
    ? await pngOf(document, text, png)
    : new Blob([text], { type: 'image/svg+xml' });

  if (host.isConnected) {
    return {
      blob,
      height: png?.height ?? height,
      warnings,
      width: png?.width ?? width,
    };
  }

  throw new Error(OFF_PAGE);
};
