import {
  BaseParagraphPlugin,
  definePlugin,
  editorCommands,
  ElementApi,
  getInjectMatch,
  locateAt,
  PLUGINS,
  property,
  schema,
  SelectionApi,
  target,
  txLocate,
  type DefinitionOf,
  type Element,
  type Location,
  type NodeKey,
  type NodeMatchPredicate,
  type NodeSelection,
} from '../../../core';
import { projectEditorView } from '../../../facade';
import {
  getIndentShiftContributors,
  hasNonWritableBlock,
  resolveTargetRoot,
  rootedBlockSelection,
  selectsCodeBlock,
  type IndentShiftPlan,
} from '../../../internal/plugin/indentShift';
import { BaseBlockquotePlugin } from '../../basic-nodes';
import { formatting } from '../../basic-styles';
import {
  isNonNegativeSafeInteger,
  toIndentLevel,
} from './indentLevel.internal';

/** Options for increasing or decreasing block indentation. */
export type IndentChangeOptions = {
  at?: Location | NodeSelection;
  match?: NodeMatchPredicate<Element>;
  mode?: 'all' | 'highest' | 'lowest';
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

const readMarginLevel = (
  styleValue: string,
  { offset = 24, unit = 'px' }: Readonly<IndentPluginState>
) => {
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

const readHtmlMarginIndent = (
  element: HTMLElement,
  state: Readonly<IndentPluginState>
) =>
  readMarginLevel(element.style.marginInlineStart, state) ??
  readMarginLevel(
    element.closest('[dir]')?.getAttribute('dir') === 'rtl'
      ? element.style.marginRight
      : element.style.marginLeft,
    state
  );

export const BaseIndentPlugin = definePlugin(PLUGINS.indent, {
  contributions: [formatting.of({ block: ['indent'] })],
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
      styleKey: 'marginInlineStart',
      transformNodeValue: ({ store, nodeValue }) => {
        const { offset = 24, unit = 'px' } = store.get();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
  update: ({ editor, plugin, schema: pluginSchema, store, tx }) => {
    const change = (
      offset: 1 | -1,
      { at, match, mode = 'lowest' }: IndentChangeOptions = {}
    ): boolean => {
      const injectMatch = getInjectMatch(editor, plugin);
      const entries = tx.nodes.blocks({
        ...(at === undefined ? {} : { at }),
        mode,
        match: (node, path) =>
          injectMatch(node, path) && (!match || match(node, path)),
      });

      if (entries.length === 0) return false;

      const { indentMax } = store.get();
      const root = resolveTargetRoot(at, tx.view.root(), tx.selection());
      const claimed = new Set<NodeKey>();
      const plans: IndentShiftPlan[] = [];
      const unclaimed = () =>
        entries.filter(([node]) => {
          const key = tx.key(node);

          return key !== null && !claimed.has(key);
        });

      for (const contribute of getIndentShiftContributors(editor)) {
        const remaining = unclaimed();

        if (remaining.length === 0) break;

        const plan = contribute({
          editor,
          entries: remaining,
          indentMax,
          offset,
          root,
          tx,
        });

        if (!plan) continue;
        plans.push(plan);
        for (const key of plan.claimed) claimed.add(key);
      }

      const genericWrites: Array<{ key: NodeKey; nextIndent: number }> = [];

      for (const [node, path] of unclaimed()) {
        if (!ElementApi.isElement(node)) continue;

        const key = tx.key(node);

        if (!key || hasNonWritableBlock(editor, path, root)) continue;

        const currentIndent = Number(
          tx.schema.getProperty(node, pluginSchema.properties.indent) ?? 0
        );

        if (
          offset > 0 &&
          typeof indentMax === 'number' &&
          currentIndent >= indentMax
        ) {
          continue;
        }
        if (offset < 0 && currentIndent <= 0) continue;

        genericWrites.push({ key, nextIndent: currentIndent + offset });
      }

      let changed = false;

      for (const plan of plans) {
        if (plan.apply(tx)) changed = true;
      }

      for (const { key, nextIndent } of genericWrites) {
        if (nextIndent <= 0) {
          tx.nodes.unset('indent', { at: key });
        } else {
          tx.nodes.set({ indent: nextIndent }, { at: key });
        }
        changed = true;
      }

      return changed;
    };

    return {
      decrease: txLocate(locateAt(0), (options?: IndentChangeOptions) =>
        change(-1, options)
      ),
      increase: txLocate(locateAt(0), (options?: IndentChangeOptions) =>
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

          // Word and Outlook ignore margin-inline-start, so copied and
          // serialized HTML keeps a physical margin.
          return {
            attributes: { 'data-indent': value },
            style: { marginLeft: value * offset + unit },
          };
        },
        match: [
          { attributes: { 'aria-level': true } },
          { attributes: { 'data-indent': true } },
          { style: { marginInlineStart: '*' } },
          { style: { marginLeft: '*' } },
          { style: { marginRight: '*' } },
        ],
      },
    }),
}).extend(({ editor: indentEditor, plugin }) => ({
  commands: ({ handle }) => [
    handle(editorCommands.delete, ({ input, state }) => {
      const selection = state.selection();
      const entry = selection
        ? state.nodes.block({ at: selection })
        : undefined;

      if (
        input.direction !== 'backward' ||
        !selection ||
        !entry ||
        state.selection.isExpanded() ||
        state.selection.nodes().length > 0
      ) {
        return false;
      }

      const [element, path] = entry;
      const root = SelectionApi.root(selection) ?? state.view.root();
      const blockKey = state.key(element);

      if (
        !blockKey ||
        !element.indent ||
        element.listType ||
        element.type !== indentEditor.plugin(BaseParagraphPlugin).schema.type ||
        !getInjectMatch(indentEditor, plugin)(element, path) ||
        !state.points.isStart(selection.anchor, blockKey) ||
        hasNonWritableBlock(indentEditor, path, root)
      ) {
        return false;
      }

      return state.transaction((tx) => {
        tx.indent.decrease({ at: rootedBlockSelection(path, root) });
      });
    }),
  ],
  // Each shortcut reads the blocks its command changes, so a caret in a Details
  // title reaches the Details and a range reaches every block it spans.
  shortcuts: {
    tab: {
      handler: ({ editor }) => {
        const selection = editor.read.selection();

        if (!selection) return false;

        const root = SelectionApi.root(selection);
        const view = root ? projectEditorView(editor, { root }) : editor;
        const entries = view.read.nodes.blocks({
          match: getInjectMatch(view, view.plugin(plugin)),
          mode: 'lowest',
        });

        if (entries.length === 0 || selectsCodeBlock(view)) return false;

        view.plugin(plugin).update.increase();

        return true;
      },
      keys: 'tab',
    },
    untab: {
      handler: ({ editor }) => {
        const selection = editor.read.selection();

        if (!selection) return false;

        const root = SelectionApi.root(selection);
        const view = root ? projectEditorView(editor, { root }) : editor;
        const entries = view.read.nodes.blocks({
          match: getInjectMatch(view, view.plugin(plugin)),
          mode: 'lowest',
        });

        if (entries.length === 0 || selectsCodeBlock(view)) return false;

        if (entries.every(([element]) => !element.indent)) {
          const quote = view.plugin(BaseBlockquotePlugin);
          const inQuote =
            quote.installed &&
            entries.some(
              ([, path]) =>
                !!view.read.nodes.above({
                  at: path,
                  match: (node, nodePath) =>
                    nodePath.length < path.length &&
                    ElementApi.isElement(node) &&
                    node.type === quote.schema.type,
                })
            );

          return !inQuote;
        }

        view.plugin(plugin).update.decrease();

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
