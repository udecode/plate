import {
  BaseParagraphPlugin,
  definePlugin,
  editorCommands,
  ElementApi,
  getInjectMatch,
  locateAt,
  PathApi,
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
  type Path,
  type PluginTransaction,
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
import { isPositiveSafeInteger, toIndentLevel } from './indentLevel.internal';

/** Options for increasing, decreasing, setting, or clearing block indentation. */
export type IndentChangeOptions = {
  at?: Location | NodeSelection;
  match?: NodeMatchPredicate<Element>;
  mode?: 'all' | 'highest' | 'lowest';
};

/** Configuration state for block margin indentation. */
export type IndentPluginState = {
  /** Maximum number of indentation levels. */
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

const indentDepthOf = (node: Element) =>
  isPositiveSafeInteger(node.indent) ? node.indent : node.listType ? 1 : 0;

// Protects list items and continuation blocks nested under a list head so
// `indent.set` / `indent.clear` cannot orphan list structure.
const isInListFamily = (tx: PluginTransaction, path: Path): boolean => {
  const index = path.at(-1);

  if (index === undefined) return false;

  const parentPath = PathApi.parent(path);
  const parent =
    parentPath.length > 0 ? tx.nodes.get(parentPath)?.[0] : undefined;
  const siblings =
    parentPath.length > 0
      ? ElementApi.isElement(parent)
        ? parent.children
        : []
      : tx.children();
  const targetNode = siblings[index];

  if (!ElementApi.isElement(targetNode)) return false;
  if (targetNode.listType) return true;

  const targetDepth = indentDepthOf(targetNode);

  if (targetDepth <= 0) return false;

  let minDepth = targetDepth;

  for (let i = index - 1; i >= 0; i -= 1) {
    const sibling = siblings[i];

    if (!ElementApi.isElement(sibling)) return false;

    const depth = indentDepthOf(sibling);

    if (depth < minDepth) {
      if (sibling.listType) return true;
      minDepth = depth;
      if (minDepth <= 0) return false;
    }
  }

  return false;
};

const clampToIndentMax = (
  level: number,
  indentMax: number | null
): number | null => {
  if (typeof indentMax !== 'number' || !Number.isFinite(indentMax)) {
    return level;
  }

  const max = Math.trunc(indentMax);

  if (max <= 0) return null;

  return Math.min(level, max);
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

/** Schema, commands, shortcuts, and HTML codec for block margin indentation. */
export const BaseIndentPlugin = definePlugin(PLUGINS.indent, {
  contributions: [formatting.of({ block: ['indent'] })],
  initialState,
  schema: ({ targetElementTypes }) => ({
    properties: {
      indent: schema.elementProperty(
        property.number({
          validate: isPositiveSafeInteger,
          validationVersion: 2,
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
    const readEntries = ({
      at,
      match,
      mode = 'lowest',
    }: IndentChangeOptions = {}) => {
      const injectMatch = getInjectMatch(editor, plugin);

      return tx.nodes.blocks({
        ...(at === undefined ? {} : { at }),
        mode,
        match: (node, path) =>
          injectMatch(node, path) && (!match || match(node, path)),
      });
    };

    const change = (
      offset: 1 | -1,
      options: IndentChangeOptions = {}
    ): boolean => {
      const entries = readEntries(options);

      if (entries.length === 0) return false;

      const { indentMax } = store.get();
      const normalizedMax =
        typeof indentMax === 'number' && Number.isFinite(indentMax)
          ? Math.trunc(indentMax)
          : null;
      const root = resolveTargetRoot(
        options.at,
        tx.view.root(),
        tx.selection()
      );
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
          indentMax: normalizedMax,
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

        if (normalizedMax !== null && normalizedMax <= 0) {
          if (currentIndent > 0) {
            genericWrites.push({ key, nextIndent: 0 });
          }
          continue;
        }
        if (
          offset > 0 &&
          normalizedMax !== null &&
          currentIndent >= normalizedMax
        ) {
          continue;
        }
        if (offset < 0 && currentIndent <= 0) continue;

        const nextIndent = Math.max(
          0,
          normalizedMax !== null
            ? Math.min(currentIndent + offset, normalizedMax)
            : currentIndent + offset
        );

        if (nextIndent === currentIndent) continue;

        genericWrites.push({ key, nextIndent });
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

    const clear = (options: IndentChangeOptions = {}): boolean => {
      const entries = readEntries(options);

      if (entries.length === 0) return false;

      const root = resolveTargetRoot(
        options.at,
        tx.view.root(),
        tx.selection()
      );
      let changed = false;

      for (const [node, path] of entries) {
        if (!ElementApi.isElement(node)) continue;

        const key = tx.key(node);

        if (
          !key ||
          hasNonWritableBlock(editor, path, root) ||
          isInListFamily(tx, path)
        ) {
          continue;
        }
        if (
          tx.schema.getProperty(node, pluginSchema.properties.indent) ===
          undefined
        ) {
          continue;
        }

        tx.nodes.unset('indent', { at: key });
        changed = true;
      }

      return changed;
    };

    const set = (level: number, options: IndentChangeOptions = {}): boolean => {
      if (typeof level !== 'number' || !Number.isFinite(level)) return false;

      const truncated = Math.trunc(level);

      if (truncated <= 0) return clear(options);

      const { indentMax } = store.get();
      const clamped = clampToIndentMax(truncated, indentMax);

      if (clamped === null) return clear(options);

      const entries = readEntries(options);

      if (entries.length === 0) return false;

      const root = resolveTargetRoot(
        options.at,
        tx.view.root(),
        tx.selection()
      );
      let changed = false;

      for (const [node, path] of entries) {
        if (!ElementApi.isElement(node)) continue;

        const key = tx.key(node);

        if (
          !key ||
          hasNonWritableBlock(editor, path, root) ||
          isInListFamily(tx, path)
        ) {
          continue;
        }

        const currentIndent = tx.schema.getProperty(
          node,
          pluginSchema.properties.indent
        );

        if (currentIndent === clamped) continue;

        tx.nodes.set({ indent: clamped }, { at: key });
        changed = true;
      }

      return changed;
    };

    return {
      clear: txLocate(locateAt(0), clear),
      decrease: txLocate(locateAt(0), (options?: IndentChangeOptions) =>
        change(-1, options)
      ),
      increase: txLocate(locateAt(0), (options?: IndentChangeOptions) =>
        change(1, options)
      ),
      set: txLocate(locateAt(1), set),
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
          Number.isFinite(indentMax) &&
          typeof indent === 'number'
        ) {
          const max = Math.trunc(indentMax);

          if (max <= 0) {
            tx.nodes.unset('indent', { at: path });
          } else if (indent > max) {
            tx.nodes.set({ indent: max }, { at: path });
          }
        }
      },
    },
  ],
}));

/** Plugin definition type for `BaseIndentPlugin`. */
export type IndentDefinition = DefinitionOf<typeof BaseIndentPlugin>;
