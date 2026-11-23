const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const PSEUDO = 'data-board-picture-pseudo';
// A property that starts as currentcolor reads as this color on the span
// whose values are the start values.
const CURRENT_COLOR = 'rgb(1, 2, 3)';
const PLACEMENT = new Set(['left', 'position', 'top', 'translate']);
const SAME_IN_COPY = new Set(['color', 'fill', 'stroke']);
// SVG 2 has presentation attributes for font-variant and white-space but none
// for their longhands: https://www.w3.org/TR/SVG2/styling.html#PresentationAttributes
const SHORTHANDS = [
  [/^font-variant-/u, 'font-variant'],
  [/^(white-space-collapse|text-wrap-mode)$/u, 'white-space'],
] as const;
const presentedAs = (name: string) =>
  SHORTHANDS.find(([longhand]) => longhand.test(name))?.[1] ?? name;
const FLEX = new Set(['flex', 'inline-flex']);
const LOGICAL = /(^|-)(block|inline)(-|$)|(start|end)-(start|end)-radius$/u;
const SIDE =
  /^(border-(?:top|right|bottom|left)|outline|column-rule)-(style|width|color)$/u;
// The 0 by 0 span reads an origin's start value 50% 50% as 0px 0px, so an
// origin is written whenever what it moves is set.
const DEPENDS = new Map<string, readonly string[]>([
  ['perspective-origin', ['perspective']],
  [
    'transform-origin',
    ['offset-path', 'rotate', 'scale', 'transform', 'translate'],
  ],
]);
// The properties the CSS specifications mark inherited, as getComputedStyle
// names them in Chromium, Firefox and WebKit. A name missing here is settled
// by the runtime test, so the list only has to hold no property that is not
// inherited.
const INHERITED = new Set([
  '-moz-osx-font-smoothing',
  '-moz-text-size-adjust',
  '-webkit-border-horizontal-spacing',
  '-webkit-border-vertical-spacing',
  '-webkit-font-smoothing',
  '-webkit-hyphenate-character',
  '-webkit-line-break',
  '-webkit-locale',
  '-webkit-print-color-adjust',
  '-webkit-rtl-ordering',
  '-webkit-tap-highlight-color',
  '-webkit-text-combine',
  '-webkit-text-decorations-in-effect',
  '-webkit-text-emphasis-color',
  '-webkit-text-emphasis-position',
  '-webkit-text-emphasis-style',
  '-webkit-text-fill-color',
  '-webkit-text-orientation',
  '-webkit-text-security',
  '-webkit-text-size-adjust',
  '-webkit-text-stroke-color',
  '-webkit-text-stroke-width',
  '-webkit-text-zoom',
  '-webkit-touch-callout',
  '-webkit-user-modify',
  '-webkit-writing-mode',
  'accent-color',
  'border-collapse',
  'border-spacing',
  'caption-side',
  'caret-color',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-rendering',
  'color-scheme',
  'cursor',
  'direction',
  'dominant-baseline',
  'dynamic-range-limit',
  'empty-cells',
  'fill',
  'fill-opacity',
  'fill-rule',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'font-width',
  'forced-color-adjust',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'image-orientation',
  'image-rendering',
  'interactivity',
  'kerning',
  'letter-spacing',
  'line-break',
  'line-height',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'marker-end',
  'marker-mid',
  'marker-start',
  'math-depth',
  'math-shift',
  'math-style',
  'orphans',
  'overflow-wrap',
  'paint-order',
  'pointer-events',
  'print-color-adjust',
  'quotes',
  'ruby-align',
  'ruby-overhang',
  'ruby-position',
  'shape-rendering',
  'speak',
  'speak-as',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'text-align',
  'text-align-last',
  'text-anchor',
  'text-autospace',
  'text-combine-upright',
  'text-decoration-skip-ink',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-spacing-trim',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'visibility',
  'white-space',
  'white-space-collapse',
  'widows',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
]);

export const PICTURE_ROOT = 'data-board-picture-root';

type Painted = HTMLElement | SVGElement;

type Declaration = readonly [name: string, value: string];

// A font face matches a family name without regard to case.
const familyKey = (family: string) =>
  family
    .trim()
    .replace(/^["']|["']$/gu, '')
    .toLowerCase();

const familiesOf = (value: string) =>
  value
    .match(/(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,])+/gu)
    ?.map(familyKey) ?? [];

const applies = (media?: MediaList) =>
  !media?.mediaText || matchMedia(media.mediaText).matches;

const sheetRulesOf = (sheet: CSSStyleSheet | null): CSSRule[] => {
  if (!sheet || sheet.disabled || !applies(sheet.media)) return [];
  try {
    return [...sheet.cssRules];
  } catch {
    return [];
  }
};

const appliedRulesOf = (rules: readonly CSSRule[]): CSSRule[] =>
  rules.flatMap((rule) => {
    if (typeof CSSImportRule !== 'undefined' && rule instanceof CSSImportRule) {
      return appliedRulesOf(sheetRulesOf(rule.styleSheet));
    }
    if (
      rule instanceof CSSMediaRule
        ? !matchMedia(rule.conditionText).matches
        : rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText)
    ) {
      return [];
    }

    return 'cssRules' in rule
      ? [rule, ...appliedRulesOf([...(rule.cssRules as CSSRuleList)])]
      : [rule];
  });

/**
 * The hidden iframe the style copy compares with. It joins the picture host in
 * the same append as the drawings and leaves with them. It hides through
 * `visibility`, because Firefox lists no computed property inside an iframe
 * with `display: none`.
 */
export const pictureFrameOf = (document: Document) => {
  const frame = document.createElement('iframe');

  frame.setAttribute(
    'style',
    'position: fixed; left: 0px; top: 0px; width: 0px; height: 0px; border: 0px; visibility: hidden;'
  );

  return frame;
};

// Chromium prints a used size to 6 significant digits twice, when it reads
// the size and when it writes the style, and reads it back rounded down to
// 1/64 px, so a mention's width can come back narrower than its text and
// wrap. Three quarters of a unit in the 6th digit prints one unit up, which
// stays on its own 1/64 px step, where half a unit can print back down.
const lifted = (name: string, value: string) => {
  const size = Number.parseFloat(value);

  return (name === 'width' || name === 'height') &&
    size > 0 &&
    value.endsWith('px')
    ? `${size + 0.75 * 10 ** (Math.floor(Math.log10(size)) - 5)}px`
    : value;
};

/**
 * Reads, while the drawings and `frame` sit in `host`, the styles that each
 * element under `roots` needs in a saved SVG under the sheet's reset, and each
 * root's `left` and `top`, which place it in the picture.
 */
export const readPictureStyles = (
  frame: HTMLIFrameElement,
  host: Element,
  roots: readonly Painted[]
) => {
  const document = host.ownerDocument;
  const view = frame.contentWindow;

  if (!view) throw new Error('The picture frame has no window.');

  const inner = view.document;
  const start = inner.createElement('span');
  const shapes = inner.createElementNS(SVG_NS, 'svg');
  const copies = new Map<string, Element>();
  const copyOf = new Map<Element, Element>();

  start.setAttribute('style', `all: initial; color: ${CURRENT_COLOR};`);
  for (const root of roots) {
    for (const element of [root, ...root.querySelectorAll('*')]) {
      if (element.namespaceURI !== SVG_NS) continue;

      const shallow = inner.importNode(element, false);

      // The written properties replace the style attribute, so the copy
      // draws as the saved file does before them.
      shallow.removeAttribute('style');

      const key = shallow.outerHTML;
      let copy = copies.get(key);

      if (!copy) {
        copy = shallow;
        copies.set(key, copy);
        shapes.append(copy);
      }
      copyOf.set(element, copy);
    }
  }
  inner.body.append(start, shapes);

  const initial = view.getComputedStyle(start);
  const names = Array.from({ length: initial.length }, (_, at) =>
    initial.item(at)
  );
  const indexOf = new Map(names.map((name, at) => [name, at]));
  const valuesOf = (style: CSSStyleDeclaration) =>
    names.map((name) => style.getPropertyValue(name));
  const startValues = valuesOf(initial);
  const reference = new Map(
    [...copies.values()].map((copy) => [
      copy,
      valuesOf(view.getComputedStyle(copy)),
    ])
  );
  const hostValues = valuesOf(getComputedStyle(host));
  const aboveValues = valuesOf(getComputedStyle(host.parentElement ?? host));
  const fromHost = names.map((_, at) => hostValues[at] !== aboveValues[at]);
  const logical = names.map((name) => LOGICAL.test(name));
  const inherited = names.map((name) => INHERITED.has(name));
  const sideOf = names.map((name) => {
    const side = SIDE.exec(name)?.[1];

    return side === undefined
      ? null
      : ([indexOf.get(`${side}-width`), indexOf.get(`${side}-style`)] as const);
  });
  const dependsOn = names.map((name) =>
    DEPENDS.get(name)?.flatMap((other) => indexOf.get(other) ?? [])
  );
  const color = indexOf.get('color') ?? -1;
  const display = indexOf.get('display') ?? -1;
  const samples = new Map<number, string>();
  const unsure: Array<[Declaration[], number, string]> = [];
  const styles: Array<[Painted, Declaration[], boolean]> = [];
  const pseudos: Array<[Element, string, Declaration[]]> = [];
  const offsets = new Map<Element, { left: number; top: number }>();

  const writtenOf = (
    values: readonly string[],
    parent: readonly string[],
    placed: boolean,
    copy?: Element
  ) => {
    const base = (copy && reference.get(copy)) ?? startValues;
    const written: Declaration[] = [];

    values.forEach((value, at) => {
      const name = names[at];

      if (value === '' || logical[at]) return;

      const [width = -1, style = -1] = sideOf[at] ?? [];

      if (
        sideOf[at] &&
        values[style] !== 'hidden' &&
        (values[width] === '0px' || values[style] === 'none')
      ) {
        return;
      }

      const depends = dependsOn[at];

      if (depends) {
        if (!depends.every((other) => values[other] === 'none')) {
          written.push([name, value]);
        }

        return;
      }
      if (value !== startValues[at] && !samples.has(at)) {
        samples.set(at, value);
      }
      if (inherited[at]) {
        // A placed root's parent in the picture is an SVG group, and the
        // board's color can equal the start color.
        if (placed && at === color) {
          written.push([name, value]);

          return;
        }
        // The host adds what no drawing shows, such as its pointer-events: none.
        if (placed && fromHost[at] && value === hostValues[at]) return;

        // currentcolor inherits as the keyword, so a property that follows
        // its element's color is written as the keyword, such as a marker's
        // color or a fill that a <use> recolors.
        const follows = at !== color && value === values[color];
        // An SVG presentation attribute is an author declaration of specificity 0,
        // so it beats an inherited value and the written style beats it:
        // https://www.w3.org/TR/SVG2/styling.html#PresentationAttributes
        const attribute =
          copy?.getAttribute(name) ?? copy?.getAttribute(presentedAs(name));

        if (attribute !== null && attribute !== undefined) {
          const keyword = attribute.trim().toLowerCase();
          let from = base[at];

          if (keyword === 'currentcolor') {
            from = at === color ? parent[at] : values[color];
          }
          if (keyword === 'inherit') from = parent[at];
          if (!SAME_IN_COPY.has(name) || value !== from) {
            written.push([name, follows ? 'currentcolor' : value]);
          }

          return;
        }
        if (at === color) {
          if (parent[at] !== value) written.push([name, value]);

          return;
        }

        const parentFollows = parent[at] === parent[color];

        if (follows ? !parentFollows : parentFollows || parent[at] !== value) {
          written.push([name, follows ? 'currentcolor' : value]);
        }

        return;
      }

      const from = startValues[at] === CURRENT_COLOR ? values[color] : base[at];

      if (value !== from || (sideOf[at] && name.endsWith('-width'))) {
        written.push([name, value]);
      } else if (parent[at] !== value) {
        unsure.push([written, at, value]);
      }
    });

    return written;
  };
  const visit = (
    element: Painted,
    parent: readonly string[],
    placed: boolean
  ) => {
    const style = getComputedStyle(element);
    const values = valuesOf(style);
    const html = element.namespaceURI !== SVG_NS;
    const copy = copyOf.get(element);

    if (placed) {
      offsets.set(element, {
        left: Number.parseFloat(style.getPropertyValue('left')) || 0,
        top: Number.parseFloat(style.getPropertyValue('top')) || 0,
      });
    }
    styles.push([
      element,
      writtenOf(values, parent, placed, copy),
      FLEX.has(parent[display] ?? ''),
    ]);
    if (html) {
      const kinds = values[display]?.includes('list-item')
        ? ['::before', '::after', '::marker']
        : ['::before', '::after'];

      for (const pseudo of kinds) {
        const generated = getComputedStyle(element, pseudo);

        if (
          pseudo !== '::marker' &&
          /^(none|normal|)$/u.test(generated.getPropertyValue('content'))
        ) {
          continue;
        }
        pseudos.push([
          element,
          pseudo,
          writtenOf(valuesOf(generated), values, false),
        ]);
      }
    }
    for (const child of element.children) {
      visit(child as Painted, values, false);
    }
  };

  for (const root of roots) visit(root, startValues, true);

  // A property off the list whose value equals its reference but not its
  // parent's is written when a child under `all: unset` takes its value.
  const tested = [...new Set(unsure.map(([, at]) => at))].filter((at) =>
    samples.has(at)
  );

  if (tested.length > 0) {
    const given = inner.createElement('div');
    const child = inner.createElement('span');

    given.setAttribute(
      'style',
      [
        'all: initial;',
        ...tested.map((at) => `${names[at]}: ${samples.get(at)};`),
      ].join(' ')
    );
    child.setAttribute('style', 'all: unset; color: rgb(4, 5, 6);');
    given.append(child);
    inner.body.append(given);

    const outer = view.getComputedStyle(given);
    const taken = view.getComputedStyle(child);
    const inherits = new Set(
      tested.filter((at) => {
        const value = outer.getPropertyValue(names[at]);

        return (
          value !== startValues[at] &&
          taken.getPropertyValue(names[at]) === value
        );
      })
    );

    for (const [written, at, value] of unsure) {
      if (inherits.has(at)) written.push([names[at], value]);
    }
  }

  const declarations = [
    ...styles.map(([, written]) => written),
    ...pseudos.map((row) => row[2]),
  ].flat();
  const valuesNamed = (wanted: string) =>
    declarations.flatMap(([name, value]) => (name === wanted ? [value] : []));
  const applied = appliedRulesOf(
    [...document.styleSheets].flatMap(sheetRulesOf)
  );
  const families = new Set(valuesNamed('font-family').flatMap(familiesOf));
  const counterRules = new Map(
    applied.flatMap((rule) =>
      typeof CSSCounterStyleRule !== 'undefined' &&
      rule instanceof CSSCounterStyleRule
        ? [[rule.name, rule] as const]
        : []
    )
  );
  const counters = new Map<string, string>();
  const counterNames = valuesNamed('list-style-type');

  for (const name of counterNames) {
    const rule = counterRules.get(name);

    if (!rule || counters.has(name)) continue;
    counters.set(name, rule.cssText);
    // A style that extends or falls back to another draws through it.
    const extended = /^extends\s+(\S+)/u.exec(rule.system)?.[1];

    counterNames.push(rule.fallback, ...(extended ? [extended] : []));
  }

  return {
    faces: applied.flatMap((rule) =>
      rule instanceof CSSFontFaceRule &&
      families.has(familyKey(rule.style.getPropertyValue('font-family')))
        ? [
            {
              base: rule.parentStyleSheet?.href ?? document.baseURI,
              css: rule.cssText,
            },
          ]
        : []
    ),
    offsets,
    /**
     * Replaces each element's style attribute with what it needs, once the
     * drawings left the host, and returns the counter styles and the
     * pseudo-element rules for the picture's sheet.
     */
    write: (srgb: (value: string) => string, nonce: string) => {
      for (const [element, written, flexItem] of styles) {
        element.removeAttribute('style');
        for (const [name, value] of written) {
          if (offsets.has(element) && PLACEMENT.has(name)) continue;
          element.style.setProperty(name, srgb(lifted(name, value)));
        }
        // A flex item keeps the used size its width and height write.
        if (flexItem) element.style.setProperty('flex', '0 0 auto');
      }

      const ids = new Map<Element, string>();
      const rules = pseudos.flatMap(([element, pseudo, written]) => {
        const kept =
          pseudo === '::marker'
            ? written.filter(
                ([name]) =>
                  name === 'content' ||
                  name === 'unicode-bidi' ||
                  INHERITED.has(name)
              )
            : written;

        if (kept.length === 0) return [];

        let id = ids.get(element);

        if (id === undefined) {
          id = String(ids.size);
          ids.set(element, id);
          element.setAttribute(PSEUDO, id);
        }

        return [
          `[${PICTURE_ROOT}="${nonce}"] [${PSEUDO}="${id}"]${pseudo} { ${kept
            .map(([name, value]) => `${name}: ${srgb(lifted(name, value))};`)
            .join(' ')} }`,
        ];
      });

      return [...counters.values(), ...rules];
    },
  };
};

/**
 * A browser ignores an `@namespace` rule that follows any rule other than
 * `@charset` or `@import`, so it comes first, and `all` leaves out `direction`
 * and `unicode-bidi`, so the reset names them.
 */
export const pictureSheetOf = (
  nonce: string,
  faces: readonly string[],
  rules: readonly string[]
) =>
  [
    `@namespace h url(${XHTML_NS});`,
    `[${PICTURE_ROOT}="${nonce}"] h|* { all: unset; direction: unset; unicode-bidi: unset; }`,
    ...faces,
    ...rules,
  ].join('\n');
