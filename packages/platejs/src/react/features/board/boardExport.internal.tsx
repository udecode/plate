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
const PNG_SCALE = 2;
const PNG_SIDE = 16_384;
const PNG_AREA = 16_777_216;
const FETCHES = 6;
const FETCH_LIMIT_MS = 5000;
const FONT_WAIT_MS = 250;
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

export type BoardPictureOptions = Readonly<{
  format: 'png' | 'svg';
  kit: readonly BasePluginInput[];
}>;

export type BoardPictureWarning = Readonly<{
  code:
    | 'content-undrawn'
    | 'downscaled'
    | 'font-missing'
    | 'image-unreadable'
    | 'shape-undrawn';
  shapeId?: string;
}>;

export type BoardPicture = Readonly<{
  blob: Blob;
  height: number;
  warnings: readonly BoardPictureWarning[];
  width: number;
}>;

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

const sourceOf = (image: Element) =>
  image.localName === 'img' ? 'src' : 'href';

const unquoted = (family: string) => family.trim().replace(/^["']|["']$/gu, '');

const familiesIn = (styles: ReturnType<typeof stylesOf>) =>
  new Set(
    styles.flatMap(([, values]) =>
      values.flatMap(([name, value]) =>
        name === 'font-family' ? value.split(',').map(unquoted) : []
      )
    )
  );

const fontFacesOf = (document: Document, families: ReadonlySet<string>) =>
  [...document.styleSheets].flatMap((sheet) => {
    let rules: CSSRule[];

    try {
      rules = [...sheet.cssRules];
    } catch {
      return [];
    }

    return rules.flatMap((rule) =>
      rule instanceof CSSFontFaceRule &&
      families.has(unquoted(rule.style.getPropertyValue('font-family')))
        ? [{ base: sheet.href ?? document.baseURI, css: rule.cssText }]
        : []
    );
  });

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

const shrunk = async (
  document: Document,
  blob: Blob,
  size: DOMRect,
  scale: number
) => {
  const url = URL.createObjectURL(blob);

  try {
    const image = document.createElement('img');

    image.src = url;
    await image.decode();

    const { naturalHeight, naturalWidth } = image;
    const fit =
      scale * Math.max(size.width / naturalWidth, size.height / naturalHeight);
    const canvas = document.createElement('canvas');
    const paint = fit < 1 ? canvas.getContext('2d') : null;

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
  { format, kit }: BoardPictureOptions
): Promise<BoardPicture | null> => {
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
  const png = format === 'png' ? pngSizeOf(width, height) : null;
  const faces = fontFacesOf(document, familiesIn(styles));
  const css: string[] = [];
  let fontMissing = false;

  await inSixes([
    ...images.map(({ id, image, size }) => async () => {
      const name = sourceOf(image);
      const href = image.getAttribute(name) ?? '';

      try {
        const blob = await fetched(href);

        image.setAttribute(
          name,
          png
            ? await shrunk(document, blob, size, png.scale)
            : await dataUrlOf(blob)
        );
      } catch {
        const link = URL.canParse(href, document.baseURI)
          ? new URL(href, document.baseURI)
          : null;

        warnings.push({ code: 'image-unreadable', shapeId: id });
        if (!png && link && /^https?:$/u.test(link.protocol)) {
          image.setAttribute(name, link.href);
        } else {
          image.replaceWith(grayOf(document, image));
        }
      }
    }),
    ...faces.map(({ base, css: face }, at) => async () => {
      try {
        let embedded = face;

        for (const [whole, url = ''] of face.matchAll(
          /url\(\s*["']?([^"')]+)["']?\s*\)/gu
        )) {
          const inlined = await dataUrlOf(
            await fetched(new URL(url, base).href)
          );

          embedded = embedded.replace(whole, `url("${inlined}")`);
        }
        css[at] = embedded;
      } catch {
        fontMissing = true;
      }
    }),
  ]);
  if (fontMissing) warnings.push({ code: 'font-missing' });

  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
  svg.setAttribute('width', String(width));
  if (css.length > 0) {
    const style = document.createElementNS(SVG_NS, 'style');

    style.textContent = css.join('\n');
    svg.append(style);
  }
  svg.append(
    rectAt(document, { height, width, x: left, y: top }, background),
    ...drawings.map((drawing) => groupOf(document, drawing, labels))
  );

  const text = new XMLSerializer().serializeToString(svg);

  if (!png) {
    return {
      blob: new Blob([text], { type: 'image/svg+xml' }),
      height,
      warnings,
      width,
    };
  }
  if (png.scale < PNG_SCALE) warnings.push({ code: 'downscaled' });

  return {
    blob: await pngOf(document, text, png),
    height: png.height,
    warnings,
    width: png.width,
  };
};
