import {
  BaseParagraphPlugin,
  definePlugin,
  ElementApi,
  getInjectMatch,
  PLUGINS,
  property,
  schema,
  target,
  txLocate,
  type DefinitionOf,
  type EditorCommandPlace,
  type EditorNodesOptions,
  type Element,
  type NodeMatchPredicate,
} from '../../../core';
import { registerFirstPartyPlugin } from '../../../internal/plugin/firstPartyPlugin';
import { BaseBlockquotePlugin } from '../../basic-nodes';
import {
  isNonNegativeSafeInteger,
  toIndentLevel,
} from './indentLevel.internal';

export type IndentChangeOptions = {
  nodes?: Omit<EditorNodesOptions<Element>, 'match'> & {
    match?: NodeMatchPredicate<Element>;
  };
};

const locateNodes = (
  [options]: [options?: IndentChangeOptions],
  place: EditorCommandPlace
): [options?: IndentChangeOptions] | null => {
  const nodes = options?.nodes;

  if (nodes?.at === undefined) return [options];

  const at = place.location(nodes.at);

  return at && [{ ...options, nodes: { ...nodes, at } }];
};

export type IndentPluginState = {
  /** Maximum number of indentation. */
  indentMax: number | null;
  /**
   * Indentation offset used in `(offset * element.indent) + unit`.
   *
   * @default 24
   */
  offset: number;
  /**
   * Indentation unit used in `(offset * element.indent) + unit`.
   *
   * @default 'px'
   */
  unit: string;
};

const initialState: IndentPluginState = {
  indentMax: null,
  offset: 24,
  unit: 'px',
};

const readHtmlMarginIndent = (
  element: HTMLElement,
  { offset = 24, unit = 'px' }: Readonly<IndentPluginState>
) => {
  const styleValue = element.style.marginLeft;

  if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) {
    return undefined;
  }

  // A margin from a source that indents on another grid, such as 40px steps,
  // decodes to the nearest level instead of losing its indentation.
  return toIndentLevel(
    Math.round(
      Number(unit ? styleValue.slice(0, -unit.length) : styleValue) / offset
    )
  );
};

export const BaseIndentPlugin = definePlugin(PLUGINS.indent, {
  initialState,
  schema: ({ targetElementTypes }) => ({
    properties: {
      indent: schema.elementProperty(
        property.number({
          validate: isNonNegativeSafeInteger,
          validationVersion: 1,
        }),
        {
          landing: 'rebase',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'marginLeft',
      transformNodeValue: ({ store, nodeValue }) => {
        const { offset = 24, unit = 'px' } = store.get();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
  update: ({ editor, plugin, schema: pluginSchema, tx }) => {
    const change = (offset: number, { nodes }: IndentChangeOptions = {}) => {
      const { match, mode = 'lowest', ...nodeOptions } = nodes ?? {};
      const injectMatch = getInjectMatch(editor, plugin);
      const entries = tx.nodes.blocks({
        ...nodeOptions,
        mode,
        match: (node, path) =>
          injectMatch(node, path) && (!match || match(node, path)),
      });

      for (const [node, path] of entries) {
        if (!ElementApi.isElement(node)) continue;

        const currentIndent = Number(
          tx.schema.getProperty(node, pluginSchema.properties.indent) ?? 0
        );
        const nextIndent = currentIndent + offset;

        if (nextIndent <= 0) {
          tx.nodes.unset('indent', { at: path });
          continue;
        }

        tx.nodes.set({ indent: nextIndent }, { at: path });
      }
    };

    return {
      decrease: txLocate(locateNodes, (options?: IndentChangeOptions) =>
        change(-1, options)
      ),
      increase: txLocate(locateNodes, (options?: IndentChangeOptions) =>
        change(1, options)
      ),
    };
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        // Priority 60 runs this before List's prepareDocument, which reads an
        // item's depth before it moves the item's later blocks one level
        // deeper, so a depth that only a margin gives must be on data-indent.
        prepareDocument: ({ document, pluginState }) => {
          document.body
            .querySelectorAll<HTMLElement>(
              'li[style]:not([data-indent]):not([aria-level])'
            )
            .forEach((item) => {
              const value = readHtmlMarginIndent(item, pluginState);

              if (value) item.dataset.indent = String(value);
            });
        },
        priority: 60,
        decode: ({ element, pluginState, preserve }) => {
          const dataValue =
            element.dataset.indent ?? element.getAttribute('aria-level');

          if (dataValue) {
            if (element.dataset.indent !== undefined) preserve('data-indent');

            return toIndentLevel(Number(dataValue));
          }
          return readHtmlMarginIndent(element, pluginState);
        },
        encode: ({ pluginState, value }) => {
          const { offset = 24, unit = 'px' } = pluginState;

          return {
            attributes: { 'data-indent': value },
            style: { marginLeft: value * offset + unit },
          };
        },
        match: [
          { attributes: { 'aria-level': true } },
          { attributes: { 'data-indent': true } },
          { style: { marginLeft: '*' } },
        ],
      },
    }),
}).extend(({ plugin }) => ({
  shortcuts: {
    tab: {
      handler: ({ editor }) => {
        const entry = editor.read.nodes.block();

        if (!entry || !getInjectMatch(editor, plugin)(...entry)) return false;

        editor.plugin(plugin).update.increase();

        return true;
      },
      keys: 'tab',
    },
    untab: {
      handler: ({ editor }) => {
        const entry = editor.read.nodes.block();

        if (!entry || !getInjectMatch(editor, plugin)(...entry)) return false;

        const [element, path] = entry;

        if (!element.indent) {
          const quote = editor.plugin(BaseBlockquotePlugin);
          const inQuote =
            quote.installed &&
            !!editor.read.nodes.above({
              at: path,
              match: (node, nodePath) =>
                nodePath.length < path.length &&
                ElementApi.isElement(node) &&
                node.type === quote.schema.type,
            });

          return !inQuote;
        }

        editor.plugin(plugin).update.decrease();

        return true;
      },
      keys: 'shift+tab',
    },
  },
  corrections: [
    {
      event: 'properties',
      correct({ editor, entry, tx }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node)) return;

        const { indentMax } = editor.plugin(BaseIndentPlugin).store.get();
        const { indent } = node;

        if (
          typeof indentMax === 'number' &&
          typeof indent === 'number' &&
          indent > indentMax
        ) {
          tx.nodes.set({ indent: indentMax }, { at: path });
        }
      },
    },
  ],
}));

export type IndentDefinition = DefinitionOf<typeof BaseIndentPlugin>;

registerFirstPartyPlugin(BaseIndentPlugin);
