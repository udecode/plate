import * as React from 'react';

import { ElementApi } from '../../../core';
import { createAuthoredEditorView } from '../../../facade';
import { shapeIdOf } from '../../../features/board/lib/boardCopy.internal';
import { type BasePluginInput, getPluginNodeClass } from '../../../lib';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { loadStaticRenderer } from '../../../static/internal/renderStaticHtmlWithOverrides';
import { getStaticRootView } from '../../../static/internal/staticDocumentView';
import { bindStaticPresentation } from '../../../static/internal/staticPresentation';
import type { BoardBox } from './boardIndex.internal';
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

type Shown = Readonly<{
  id: string;
  image: HTMLElement | SVGElement;
  size: DOMRect;
}>;

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
  size: DOMRect,
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
  labels: ReadonlyMap<Element, DOMRect>,
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

export const drawBoardPicture = async (
  view: Pick<BoardView, 'pictureSource'>,
  selected: readonly string[],
  format: BoardPictureOptions['format'],
  kit: readonly BasePluginInput[]
): Promise<BoardPicture | null> => {
  const { renderToStaticMarkup } = await loadStaticRenderer();
  const source = view.pictureSource(selected);

  if (!source) throw new Error(OFF_PAGE);

  const { editor, host, layouts, projection, root } = source;
  const picture = createAuthoredEditorView(editor, {
    readOnly: true,
    ...(projection && { authored: { preview: projection } }),
  });
  const missing = bindStaticPresentation(picture, { plugins: kit });
  const data = renderToStaticMarkup(
    <PictureShapes editor={picture} root={root} />
  );
  const document = host.ownerDocument;
  const { baseURI } = document;
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

      return id === null || node.getAttribute('data-editor-path')?.includes(',')
        ? []
        : [[id, node] as const];
    })
  );
  const warnings: BoardPictureWarning[] = [];
  const drawings: Drawing[] = [];

  for (const { box, id } of layouts) {
    if (!kept.has(id)) continue;

    const drawing = shown.get(id);

    if (drawing) {
      if (inOrUnder(drawing, '[data-board-image-unreadable]')) {
        warnings.push({ code: 'image-unreadable', shapeId: id });
      }
      drawings.push({ box: boxIn(drawing), drawing, id });
    } else {
      warnings.push({ code: 'shape-undrawn', shapeId: id });
      drawings.push({ box, drawing: null, id });
    }
  }
  if (drawings.length === 0) return null;
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

  const placed = drawings.flatMap(({ drawing }) => [
    ...(drawing?.querySelectorAll<HTMLElement | SVGElement>(
      ':scope > svg, :scope > [data-board-arrow-label]'
    ) ?? []),
  ]);
  const frame = pictureFrameOf(document);

  host.append(...drawings.flatMap(({ drawing }) => drawing ?? []), frame);

  const origin = host.getBoundingClientRect();
  const edges = edgesOf(
    drawings.flatMap(({ box, drawing }) => [
      box,
      ...(drawing ? paintedIn(drawing, origin) : []),
    ])
  );
  const styles = readPictureStyles(frame, host, placed);
  const labels = new Map(
    placed
      .filter((element) => element.hasAttribute('data-board-arrow-label'))
      .map((label) => [label, label.getBoundingClientRect()])
  );
  const images: Shown[] = placed.flatMap((drawn) =>
    [...drawn.querySelectorAll<HTMLElement | SVGElement>('image, img')]
      .filter((image) => image.getAttribute(sourceOf(image)))
      .map((image) => ({
        id:
          image
            .closest('[data-board-picture]')
            ?.getAttribute('data-board-picture') ?? '',
        image,
        size: image.getBoundingClientRect(),
      }))
  );
  const srgb = srgbOf(document);
  const background = backgroundOf(host, srgb);

  host.replaceChildren();
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
