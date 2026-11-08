import {
  BaseParagraphPlugin,
  createBlockFenceInputRule,
  defineInputRule,
  definePlugin,
  type ElementOf,
  type HtmlMatcher,
  type HtmlPrepareDiagnosticInput,
  matchDelimitedInline,
  type NodeInsertOptions,
  type PluginFormatRegistry,
  type PluginReference,
  type SelectionInputRuleContext,
  PLUGINS,
  property,
  txLocate,
  locateAt,
} from '../../core';
import {
  compileMatcher,
  matches,
} from '../../lib/plugins/html/htmlMatcher.internal';
import { type MathmlTex, rebuildTexFromMathml } from './mathmlTex.internal';

const INLINE_EQUATION_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_EQUATION_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;
const EQUATION_ATTRIBUTES = [
  'data-editor-equation',
  'data-editor-equation-latex',
] as const;
const EQUATION_SELECTOR = 'math, [data-editor-equation]';
const BLOCK_EQUATION_MATCH = [
  { attributes: { 'data-editor-equation': 'block' } },
  { attributes: { display: 'block' }, tag: 'math' },
] as const satisfies readonly HtmlMatcher[];
const BLOCK_EQUATION_MATCHERS = BLOCK_EQUATION_MATCH.map((matcher, index) =>
  compileMatcher(PLUGINS.equation, matcher, index)
);

const readEquationTex = (element: Element) => {
  const latex = element.getAttribute('data-editor-equation-latex');

  if (latex !== null) return latex;
  for (const annotation of element.querySelectorAll(
    'annotation[encoding="application/x-tex"]'
  )) {
    if (annotation.closest('math') === element) {
      return annotation.textContent ?? '';
    }
  }
  if (
    !element
      .getAttribute('typeof')
      ?.split(/[\t\n\f\r ]+/u)
      .includes('mw:Extension/math')
  ) {
    return undefined;
  }
  try {
    const tex = JSON.parse(element.getAttribute('data-mw') ?? '')?.body?.extsrc;

    return typeof tex === 'string' ? tex : undefined;
  } catch {
    return undefined;
  }
};

const BLANK_TEXT = /^[\t\n\f\r ]*$/u;

const holdsOnly = (parent: Element, keeps: (node: Node) => boolean) =>
  Array.from(parent.childNodes).every(
    (node) =>
      keeps(node) ||
      (node.nodeType === 3 && BLANK_TEXT.test(node.textContent ?? ''))
  );

// KaTeX writes a formula as its MathML beside its drawn glyphs.
const readKatexOutputMath = (katex: Element) => {
  const maths = katex.querySelectorAll('math');
  const math = maths[0];
  const mathml = math?.parentElement;

  if (
    maths.length !== 1 ||
    mathml?.parentElement !== katex ||
    !mathml.classList.contains('katex-mathml') ||
    !holdsOnly(mathml, (node) => node === math) ||
    !holdsOnly(
      katex,
      (node) =>
        node === mathml ||
        (node.nodeType === 1 &&
          (node as Element).classList.contains('katex-html'))
    )
  ) {
    return undefined;
  }

  return math;
};

const SHOWN_SIBLINGS_READ = 2;

// MathJax 2 writes a formula's letters as text in one hidden element beside
// its MathML, so a formula rebuilt from that MathML would paste twice.
const findDrawnBesideLetters = (root: Element, maths: readonly Element[]) => {
  const blank = new Map<Node, boolean>();
  const shown = new Map<Node, Node[]>();
  const isBlank = (node: Node): boolean => {
    let known = blank.get(node);

    if (known === undefined) {
      known = true;
      if (node.nodeType === 3) known = BLANK_TEXT.test(node.nodeValue ?? '');
      else if (node.nodeType === 1) {
        for (const child of node.childNodes) {
          if (!isBlank(child)) {
            known = false;
            break;
          }
        }
      }
      blank.set(node, known);
    }

    return known;
  };
  const shownChildren = (parent: Node) => {
    let children = shown.get(parent);

    if (children === undefined) {
      children = [];
      for (const child of parent.childNodes) {
        if (children.length > SHOWN_SIBLINGS_READ) break;
        if (!isBlank(child)) children.push(child);
      }
      shown.set(parent, children);
    }

    return children;
  };
  const isDrawnBesideLetters = (math: Element) => {
    for (let child = math; child !== root;) {
      const parent = child.parentElement;

      if (!parent) return false;
      const [other, second] = shownChildren(parent).filter(
        (node) => node !== child
      );

      if (second) return false;
      if (other) {
        return (
          other.nodeType === 1 &&
          (other as Element).getAttribute('aria-hidden') === 'true'
        );
      }
      child = parent;
    }

    return false;
  };

  return new Set(maths.filter(isDrawnBesideLetters));
};

const listOf = (items: readonly string[], last: string, separator = ',') =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(`${separator} `)}${separator === ',' ? '' : separator} ${last} ${items.at(-1)}`;

const rebuildWarning = (
  rebuilt: Exclude<MathmlTex, { kind: 'refused' }>
): HtmlPrepareDiagnosticInput => {
  const lost =
    rebuilt.kind === 'approximate'
      ? ` without its ${listOf(rebuilt.lost, 'and')}`
      : '';
  const picks =
    rebuilt.picks.length === 0
      ? ''
      : `${lost ? ',' : ''} and picked ${listOf(
          rebuilt.picks.map(
            ({ name, others }) => `${name} over ${listOf(others, 'or')}`
          ),
          'and',
          ';'
        )}`;

  return {
    action: 'replaced',
    kind: rebuilt.kind === 'approximate' ? 'style' : 'attribute',
    message: `Plate HTML decode rebuilt the TeX of <math> from its MathML${lost}${picks}.`,
  };
};

const prepareEquationHtml = ({
  document,
  registry,
  report,
}: Readonly<{
  document: Document;
  registry: PluginFormatRegistry;
  report: (diagnostic: HtmlPrepareDiagnosticInput) => void;
}>) => {
  const { body } = document;

  if (!body.querySelector(EQUATION_SELECTOR)) return;

  const hasBlock = registry.has(PLUGINS.equation);
  const hasInline = registry.has(PLUGINS.inlineEquation);
  const hasLink = registry.has(PLUGINS.link);
  const isTaken = (element: Element & ElementCSSInlineStyle) =>
    hasInline ||
    (hasBlock &&
      BLOCK_EQUATION_MATCHERS.some((matcher) => matches(element, matcher)));
  const formulas = Array.from(body.querySelectorAll('math'))
    .filter((math) => !math.parentElement?.closest('math'))
    .map((math) => ({
      block: math.getAttribute('display') === 'block',
      math,
    }));

  for (const { block, math } of formulas) {
    if (block && (!hasBlock || math.closest('li, h1, h2, h3, h4, h5, h6'))) {
      math.removeAttribute('display');
    }
  }
  const katexes = Array.from(body.querySelectorAll('span.katex')).flatMap(
    (katex) => {
      const math =
        readEquationTex(katex) === undefined
          ? readKatexOutputMath(katex)
          : undefined;

      return math ? [{ katex, math }] : [];
    }
  );
  const katexMaths = new Set(katexes.map(({ math }) => math));
  const carriesTex = (math: Element) => {
    for (
      let carrier = math.parentElement?.closest('[data-editor-equation]');
      carrier;
      carrier = carrier.parentElement?.closest('[data-editor-equation]')
    ) {
      if (readEquationTex(carrier) !== undefined) return true;
    }

    return false;
  };
  const warnings = new Map<Element, HtmlPrepareDiagnosticInput>();
  const refusals = new Map<Element, string>();
  const besideLetters = findDrawnBesideLetters(
    body,
    formulas.flatMap(({ math }) => (katexMaths.has(math) ? [] : [math]))
  );

  for (const { math } of formulas) {
    if (
      readEquationTex(math) !== undefined ||
      !isTaken(math) ||
      carriesTex(math) ||
      besideLetters.has(math)
    ) {
      continue;
    }
    const rebuilt = rebuildTexFromMathml(
      math,
      math.getAttribute('display') === 'block' ? 'block' : 'inline'
    );

    if (rebuilt.kind === 'refused') {
      refusals.set(math, rebuilt.element.localName);
      continue;
    }
    math.setAttribute('data-editor-equation-latex', rebuilt.tex);
    if (rebuilt.kind === 'approximate' || rebuilt.picks.length > 0) {
      warnings.set(math, rebuildWarning(rebuilt));
    }
  }
  const kept = new Set<Element>();
  const dropped = new Set<Element>();
  const unwrapped = new Set<Element>();
  const indents: Array<readonly [Element, string]> = [];

  for (const element of Array.from(
    body.querySelectorAll<HTMLElement | MathMLElement>(EQUATION_SELECTOR)
  )) {
    let outer = element.parentElement?.closest(EQUATION_SELECTOR);

    while (outer && !kept.has(outer) && !dropped.has(outer)) {
      outer = outer.parentElement?.closest(EQUATION_SELECTOR);
    }
    if (outer) continue;
    const isMath = element.tagName === 'MATH';
    const refused = refusals.get(element);
    const reason = isTaken(element)
      ? readEquationTex(element) === undefined
        ? refused
          ? `whose <${refused}> has no TeX form`
          : 'which holds no TeX source'
        : undefined
      : 'which has no equation plugin to take it';

    if (reason) {
      if (isMath) {
        report({
          action: 'dropped',
          element,
          kind: 'element',
          message: `Plate HTML decode dropped <math>, ${reason}.`,
        });
        dropped.add(element);
      }
      continue;
    }
    kept.add(element);

    const warning = warnings.get(element);

    if (warning) report({ ...warning, element });

    let link = hasLink ? element.closest('a') : null;

    while (link && unwrapped.has(link)) {
      link = link.parentElement?.closest('a') ?? null;
    }
    if (link?.getAttribute('href')) {
      report({
        action: 'unwrapped',
        element: link,
        kind: 'attribute',
        message:
          'Plate HTML decode removed the link around an equation, because a link holds only text.',
      });
      unwrapped.add(link);
    }

    const indent = element.closest('p')?.getAttribute('data-indent');

    if (
      isMath &&
      element.getAttribute('display') === 'block' &&
      indent &&
      !element.hasAttribute('data-indent')
    ) {
      indents.push([element, indent]);
    }
  }

  for (const { katex, math } of katexes) {
    if (!kept.has(math)) continue;
    const display = katex.parentElement;
    const target =
      display?.classList.contains('katex-display') &&
      holdsOnly(display, (node) => node === katex)
        ? display
        : katex;

    target.replaceWith(math);
  }
  for (const math of dropped) math.remove();
  for (const link of unwrapped) {
    link.replaceWith(...Array.from(link.childNodes));
  }
  for (const [math, indent] of indents) {
    math.setAttribute('data-indent', indent);
  }
};

const decodeEquationHtml = ({
  element,
  preserve,
}: Readonly<{
  element: Element;
  preserve: (...attributes: readonly string[]) => void;
}>) => {
  const latex = readEquationTex(element);

  if (latex === undefined) return undefined;
  preserve(...EQUATION_ATTRIBUTES);

  return { children: [{ text: '' }], latex };
};

export const BaseEquationPlugin = definePlugin(PLUGINS.equation, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: decodeEquationHtml,
        encode: ({ content, node, preserve }) => {
          preserve('latex');

          return {
            attributes: {
              'data-editor-equation': 'block',
              'data-editor-equation-latex': node.latex,
            },
            children: [content, { text: `$$${node.latex}$$` }],
            tag: 'div',
          };
        },
        match: BLOCK_EQUATION_MATCH,
        prepareDocument: prepareEquationHtml,
        priority: 12,
      },
      plainText: {
        encode: ({ node }) => node.latex,
      },
      markdown: {
        node: 'math',
        decode: ({ node }) => ({
          children: [{ text: '' }],
          latex: node.value,
          type,
        }),
        encode: ({ node, preserve }) => {
          preserve('latex');

          return { type: 'math', value: node.latex };
        },
      },
    }),
  schema: {
    element: {
      properties: {
        latex: property.string({ default: '', omitDefault: false }),
      },
      void: 'block',
    },
  },
});

export const BaseInlineEquationPlugin = definePlugin(PLUGINS.inlineEquation, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: decodeEquationHtml,
        encode: ({ content, node, preserve }) => {
          preserve('latex');

          return {
            attributes: {
              'data-editor-equation': true,
              'data-editor-equation-latex': node.latex,
            },
            children: [content, { text: `$${node.latex}$` }],
            tag: 'span',
          };
        },
        match: [
          { attributes: { 'data-editor-equation': true } },
          { tag: 'math' },
        ],
        prepareDocument: prepareEquationHtml,
        priority: 11,
      },
      plainText: {
        encode: ({ node }) => node.latex,
      },
      markdown: {
        node: 'inlineMath',
        decode: ({ node }) => ({
          children: [{ text: '' }],
          latex: node.value,
          type,
        }),
        encode: ({ node, preserve }) => {
          preserve('latex');

          return { type: 'inlineMath', value: node.latex };
        },
      },
    }),
  schema: {
    element: {
      properties: {
        latex: property.string({ default: '', omitDefault: false }),
      },
      void: 'inline',
    },
  },
}).extend(({ schema: { type } }) => ({
  update: ({ tx }) => ({
    insert: txLocate(
      locateAt(1),
      ({ latex }: { latex?: string } = {}, options: NodeInsertOptions = {}) => {
        tx.nodes.insert(
          {
            children: [{ text: '' }],
            latex: latex ?? tx.text.string(),
            type,
          },
          options
        );
      }
    ),
  }),
}));

export type BlockEquationElement = ElementOf<typeof BaseEquationPlugin>;
export type InlineEquationElement = ElementOf<typeof BaseInlineEquationPlugin>;
export type EquationElement = BlockEquationElement | InlineEquationElement;

type InlineMathMatch = {
  deleteRange: NonNullable<
    ReturnType<typeof matchDelimitedInline>
  >['deleteRange'];
  latex: string;
};

export const MathRules = (() => {
  type CommonOptions = {
    enabled?: (context: SelectionInputRuleContext) => boolean;
    priority?: number;
  };

  const isEnabled = (
    context: SelectionInputRuleContext,
    enabled: CommonOptions['enabled']
  ) =>
    (!enabled || enabled(context)) &&
    !context.editor.read.nodes.some({
      type: [BaseEquationPlugin, BaseInlineEquationPlugin],
    });

  const blockRule = ({
    block = BaseParagraphPlugin,
    enabled,
    fence = '$$',
    on,
    priority = 100,
  }: CommonOptions & {
    block?: PluginReference | string;
    fence?: string;
    on: 'break' | 'match';
  }) =>
    createBlockFenceInputRule({
      block,
      fence,
      on,
      priority,
      enabled: (context) => isEnabled(context, enabled),
      apply: ({ editor, tx }, match) => {
        tx.nodes.remove({ at: match.path });
        tx.nodes.insert(
          {
            children: [{ text: '' }],
            latex: '',
            type: editor.plugin(BaseEquationPlugin).schema.type,
          },
          {
            at: match.path,
            select: true,
          }
        );
      },
    });

  const inline = ({ enabled, priority }: CommonOptions = {}) =>
    defineInputRule(BaseInlineEquationPlugin, {
      target: 'insertText',
      trigger: '$',
      priority,
      enabled: (context) => isEnabled(context, enabled),
      resolve: (context) => {
        const match = matchDelimitedInline(context, {
          boundaryRe: INLINE_EQUATION_BOUNDARY_RE,
          followRe: INLINE_EQUATION_FOLLOW_RE,
          open: '$',
          requireClosingDelimiter: false,
          trim: 'reject',
        });

        if (!match) return undefined;

        return {
          deleteRange: match.deleteRange,
          latex: match.content,
        } satisfies InlineMathMatch;
      },
      apply: ({ editor, tx }, match) => {
        tx.text.delete({ at: match.deleteRange });
        tx.selection.set(match.deleteRange.anchor);
        tx.nodes.insert({
          children: [{ text: '' }],
          latex: match.latex,
          type: editor.plugin(BaseInlineEquationPlugin).schema.type,
        });
      },
    });

  return {
    markdown: (
      options:
        | (NonNullable<Parameters<typeof inline>[0]> & { variant: '$' })
        | (Parameters<typeof blockRule>[0] & { variant: '$$' })
    ) => {
      if (options.variant === '$$') {
        const { variant: _, ...ruleOptions } = options;

        return blockRule(ruleOptions);
      }

      const { variant: _, ...ruleOptions } = options;

      return inline(ruleOptions);
    },
  };
})();
