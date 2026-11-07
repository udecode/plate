import {
  BaseParagraphPlugin,
  createBlockFenceInputRule,
  defineInputRule,
  definePlugin,
  type ElementOf,
  type HtmlMappingDiagnosticInput,
  type HtmlMatcher,
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

const isBlockEquation = (element: Element) =>
  BLOCK_EQUATION_MATCH.some(
    (matcher) =>
      (!('tag' in matcher) || element.localName === matcher.tag) &&
      Object.entries(matcher.attributes).every(
        ([name, value]) => element.getAttribute(name) === value
      )
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

const holdsOnly = (parent: Element, keeps: (node: Node) => boolean) =>
  Array.from(parent.childNodes).every(
    (node) =>
      keeps(node) ||
      (node.nodeType === 3 && /^[\t\n\f\r ]*$/u.test(node.textContent ?? ''))
  );

// KaTeX writes a formula as its MathML beside its drawn glyphs.
const readKatexOutputMath = (katex: Element) => {
  if (readEquationTex(katex) !== undefined) return undefined;
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

  return readEquationTex(math) === undefined ? undefined : math;
};

const prepareEquationHtml = ({
  document,
  registry,
  report,
}: Readonly<{
  document: Document;
  registry: PluginFormatRegistry;
  report: (diagnostic: HtmlMappingDiagnosticInput) => void;
}>) => {
  const { body } = document;

  if (!body.querySelector(EQUATION_SELECTOR)) return;

  const hasBlock = registry.has(PLUGINS.equation);
  const hasInline = registry.has(PLUGINS.inlineEquation);
  const hasLink = registry.has(PLUGINS.link);
  const isTaken = (element: Element) =>
    hasInline || (hasBlock && isBlockEquation(element));

  for (const katex of Array.from(body.querySelectorAll('span.katex'))) {
    const math = readKatexOutputMath(katex);

    if (!math) continue;
    const display = katex.parentElement;

    (display?.classList.contains('katex-display') &&
    holdsOnly(display, (node) => node === katex)
      ? display
      : katex
    ).replaceWith(math);
  }

  const kept = new Set<Element>();

  for (const element of Array.from(body.querySelectorAll(EQUATION_SELECTOR))) {
    let outer = element.parentElement?.closest(EQUATION_SELECTOR);

    while (outer && !kept.has(outer)) {
      outer = outer.parentElement?.closest(EQUATION_SELECTOR);
    }
    if (outer || !body.contains(element)) continue;
    const isMath = element.tagName === 'MATH';

    if (
      isMath &&
      element.getAttribute('display') === 'block' &&
      (!hasBlock || element.closest('li, h1, h2, h3, h4, h5, h6'))
    ) {
      element.removeAttribute('display');
    }
    const reason =
      readEquationTex(element) === undefined
        ? 'holds no TeX source'
        : isTaken(element)
          ? undefined
          : 'has no equation plugin to take it';

    if (reason) {
      if (isMath) {
        report({
          action: 'dropped',
          kind: 'element',
          message: `Plate HTML decode dropped <math>, which ${reason}.`,
        });
        element.remove();
      }
      continue;
    }
    kept.add(element);

    const link = hasLink ? element.closest('a') : null;

    if (link?.getAttribute('href')) {
      link.replaceWith(...Array.from(link.childNodes));
      report({
        action: 'unwrapped',
        kind: 'attribute',
        message:
          'Plate HTML decode removed the link around an equation, because a link holds only text.',
      });
    }

    const indent = element.closest('p')?.getAttribute('data-indent');

    if (
      isMath &&
      element.getAttribute('display') === 'block' &&
      indent &&
      !element.hasAttribute('data-indent')
    ) {
      element.setAttribute('data-indent', indent);
    }
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
