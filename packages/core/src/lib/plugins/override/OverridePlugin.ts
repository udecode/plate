import {
  editorCommands,
  ElementApi,
  PathApi,
  PointApi,
  type Path,
  type EditorStateView,
  type EditorTransactionSpecBuilder,
  type Element,
} from '@platejs/plite';
import { getEditorDefaultBlockType } from '@platejs/plite/internal';

import type { BaseEditor } from '../../editor/BaseEditor';
import type { AnyBasePlugin } from '../../plugin/BasePlugin';
import type { MatchRules } from '../../plugin/PluginConfig';

import { createBasePlugin } from '../../plugin/createBasePlugin';
import { getPluginByType } from '../../plugin/getBasePlugin';
import { getEditorPlugin } from '../../plugin/getEditorPlugin';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';

const resetBlock = (
  editor: BaseEditor,
  tx: Pick<EditorTransactionSpecBuilder, 'blocks'>,
  at: Path
) => {
  tx.blocks.reset(
    { type: getEditorDefaultBlockType(editor) },
    {
      at,
    }
  );
};

const getRuleOverridePlugin = (
  editor: BaseEditor,
  rule: MatchRules,
  node: Element,
  path: Path,
  hasRules: (plugin: AnyBasePlugin) => boolean
) => {
  for (const key of getPlateRuntime(editor).pluginCache.rules.match) {
    const plugin = editor.getPlugin({ key });
    const match = plugin?.rules?.match;

    if (
      plugin &&
      hasRules(plugin) &&
      typeof match === 'function' &&
      match({
        ...getEditorPlugin(editor, plugin),
        node,
        path,
        rule,
      })
    ) {
      return plugin;
    }
  }

  return null;
};

const insertExitBreak = (
  editor: BaseEditor,
  tx: EditorTransactionSpecBuilder
) => {
  const selection = tx.selection();

  if (!selection) return false;
  if (!tx.selection.isCollapsed()) return false;

  const block = tx.nodes.block({ at: selection.focus });

  if (!block) return false;

  const defaultBlock = tx.schema.createAndFill(
    getEditorDefaultBlockType(editor)
  );
  const target = tx.nodes.above({
    at: block[1],
    match: (node, path) =>
      path.length === 1 ||
      (path.length > 1 &&
        ElementApi.isElement(node) &&
        typeof node.type === 'string' &&
        tx.schema.findWrapping(node, defaultBlock)?.length === 0),
  });
  const ancestorPath = target?.[1] ?? block[1];
  const targetPath = PathApi.next(ancestorPath);

  tx.nodes.insert(
    {
      children: [{ text: '' }],
      type: getEditorDefaultBlockType(editor),
    },
    {
      at: targetPath,
      select: true,
    }
  );

  return true;
};

const executeBreakRuleAction = (
  editor: BaseEditor,
  tx: EditorTransactionSpecBuilder,
  action: string | undefined,
  blockPath: Path
) => {
  if (!action || action === 'default') return false;
  if (action === 'none') return true;
  if (action === 'reset') {
    resetBlock(editor, tx, blockPath);
    return true;
  }
  if (action === 'lineBreak') {
    tx.break.insertSoft();
    return true;
  }
  if (action === 'lift' && blockPath.length > 0) {
    tx.blocks.lift({ at: blockPath });
    return true;
  }
  if (action === 'exit') {
    return insertExitBreak(editor, tx);
  }
  if (action === 'deleteExit') {
    tx.text.deleteBackward({ unit: 'character' });
    return insertExitBreak(editor, tx);
  }

  return false;
};

const executeDeleteRuleAction = (
  editor: BaseEditor,
  tx: EditorTransactionSpecBuilder,
  action: string | undefined,
  blockPath: Path
) => {
  if (action === 'reset') {
    resetBlock(editor, tx, blockPath);
    return true;
  }
  if (action === 'lift' && blockPath.length > 0) {
    tx.blocks.lift({ at: blockPath });
    return true;
  }

  return false;
};

const selectAdjacentBlockVoid = (
  tx: EditorTransactionSpecBuilder,
  adjacent: readonly [unknown, Path] | undefined,
  current: readonly [Element, Path]
) => {
  if (
    !adjacent ||
    !ElementApi.isElement(adjacent[0]) ||
    !tx.schema.isVoid(adjacent[0])
  ) {
    return false;
  }

  const start = tx.points.start(adjacent[1]);

  if (!start) return false;

  tx.selection.set(start);

  if (tx.nodes.isEmpty(current[0])) {
    tx.nodes.remove({ at: current[1] });
  }

  return true;
};

const getEffectiveBreakRules = (
  editor: BaseEditor,
  rule: MatchRules,
  blockNode: Element,
  blockPath: Path
) => {
  const plugin = getPluginByType(editor, blockNode.type);
  const overridePlugin = getRuleOverridePlugin(
    editor,
    rule,
    blockNode,
    blockPath,
    (candidate) => !!candidate.rules?.break
  );

  return overridePlugin?.rules.break ?? plugin?.rules?.break;
};

const getEffectiveDeleteRules = (
  editor: BaseEditor,
  rule: MatchRules,
  blockNode: Element,
  blockPath: Path
) => {
  const plugin = getPluginByType(editor, blockNode.type);
  const overridePlugin = getRuleOverridePlugin(
    editor,
    rule,
    blockNode,
    blockPath,
    (candidate) => !!candidate.rules?.delete
  );

  return overridePlugin?.rules.delete ?? plugin?.rules?.delete;
};

const getPreviousCharacter = (
  state: Pick<EditorStateView, 'points' | 'ranges' | 'selection' | 'text'>
) => {
  const selection = state.selection();
  const before = selection
    ? state.points.before(selection, { unit: 'character' })
    : undefined;

  if (!selection || !before) return '';

  const range = state.ranges.get(before, selection);

  return range ? state.text.string(range) : '';
};

const getRuntimeChildren = (node: unknown) => {
  if (Array.isArray(node)) return node;

  return node &&
    typeof node === 'object' &&
    'children' in node &&
    Array.isArray((node as { children?: unknown }).children)
    ? (node as { children: unknown[] }).children
    : null;
};

const isRuntimeTextNode = (node: unknown): node is { text: string } =>
  node !== null &&
  typeof node === 'object' &&
  'text' in node &&
  typeof (node as { text?: unknown }).text === 'string';

const getRuntimeNodeText = (node: unknown): string => {
  if (isRuntimeTextNode(node)) return node.text;

  const children = getRuntimeChildren(node);

  if (!children) return '';

  return children.map(getRuntimeNodeText).join('');
};

const getMergeOverrideRules = (
  editor: BaseEditor,
  rule: MatchRules,
  node: Element,
  path: Path
) => {
  for (const key of getPlateRuntime(editor).pluginCache.rules.match) {
    const plugin = editor.getPlugin({ key });
    const match = plugin?.rules?.match;

    if (
      plugin?.rules?.merge &&
      typeof match === 'function' &&
      match({
        ...getEditorPlugin(editor, plugin),
        node,
        path,
        rule,
      })
    ) {
      return plugin.rules.merge;
    }
  }

  return null;
};

const shouldRemoveEmptyMergeTarget = (
  editor: BaseEditor,
  node: Element,
  path: Path
) => {
  const type = typeof node.type === 'string' ? node.type : undefined;
  const plugin = type ? getPluginByType(editor, type) : undefined;

  if (!plugin) return true;
  // Plugin-owned blocks preserve empty merge targets unless they opt into removal.
  if (!plugin.rules?.merge?.removeEmpty) return false;

  const overrideRules = getMergeOverrideRules(
    editor,
    'merge.removeEmpty',
    node,
    path
  );

  return overrideRules?.removeEmpty !== false;
};

/** Override the editor based on resolved Plate plugin node behavior. */
export const OverridePlugin = createBasePlugin({
  key: 'override',
  extension: ({ editor }) => ({
    commands: ({ around, handle }) => [
      around(editorCommands.insertBreak, ({ next, state }) => {
        const selection = state.selection();
        const block = state.nodes.block();

        if (!selection || !block) return false;

        const [blockNode, blockPath] = block;
        const runAction = (action: string | undefined) => {
          let handled = false;
          const transaction = state.transaction((tx) => {
            handled = executeBreakRuleAction(editor, tx, action, blockPath);
          });

          return handled ? transaction : null;
        };

        if (state.selection.isCollapsed() && state.nodes.isEmpty(blockNode)) {
          const rules = getEffectiveBreakRules(
            editor,
            'break.empty',
            blockNode,
            blockPath
          );
          const action = runAction(rules?.empty);

          if (action) return action;
        }

        if (
          state.selection.isCollapsed() &&
          !state.nodes.isEmpty(blockNode) &&
          state.points.isEnd(selection.anchor, blockPath) &&
          getPreviousCharacter(state) === '\n'
        ) {
          const rules = getEffectiveBreakRules(
            editor,
            'break.emptyLineEnd',
            blockNode,
            blockPath
          );
          const action = runAction(rules?.emptyLineEnd);

          if (action) return action;
        }

        const defaultRules = getEffectiveBreakRules(
          editor,
          'break.default',
          blockNode,
          blockPath
        );
        const defaultAction = runAction(defaultRules?.default);

        if (defaultAction) return defaultAction;

        const splitResetRules = getEffectiveBreakRules(
          editor,
          'break.splitReset',
          blockNode,
          blockPath
        );

        if (splitResetRules?.splitReset && !state.selection.isAcrossBlocks()) {
          const isAtStart = state.selection.isAtBlockStart();
          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            resetBlock(
              editor,
              tx,
              isAtStart ? blockPath : PathApi.next(blockPath)
            );
          });
        }

        return false;
      }),
      handle(editorCommands.delete, ({ input, state }) => {
        const selection = state.selection();

        if (!selection || !state.selection.isCollapsed()) return false;

        const block = state.nodes.block();

        if (input.direction === 'forward') {
          if (block && state.points.isEnd(selection.anchor, block[1])) {
            let handled = false;
            const transaction = state.transaction((tx) => {
              handled = selectAdjacentBlockVoid(
                tx,
                state.nodes.next({ at: block[1] }),
                block
              );
            });

            if (handled) return transaction;
          }

          return false;
        }

        if (block) {
          const [blockNode, blockPath] = block;

          if (state.points.isStart(selection.anchor, blockPath)) {
            const previous = state.nodes.previous({ at: blockPath });

            if (
              previous &&
              ElementApi.isElement(previous[0]) &&
              !state.schema.isVoid(previous[0]) &&
              previous[0].children.length > 0 &&
              getRuntimeNodeText(previous[0]).length === 0 &&
              !shouldRemoveEmptyMergeTarget(editor, previous[0], previous[1])
            ) {
              return state.transaction((tx) => {
                tx.nodes.merge({ at: blockPath });
              });
            }

            let selectedAdjacent = false;
            const selectAdjacent = state.transaction((tx) => {
              selectedAdjacent = selectAdjacentBlockVoid(tx, previous, [
                blockNode,
                blockPath,
              ]);
            });

            if (selectedAdjacent) return selectAdjacent;

            const rules = getEffectiveDeleteRules(
              editor,
              'delete.start',
              blockNode,
              blockPath
            );
            let handledRule = false;
            const ruleTransaction = state.transaction((tx) => {
              handledRule = executeDeleteRuleAction(
                editor,
                tx,
                rules?.start,
                blockPath
              );
            });

            if (handledRule) return ruleTransaction;
          }

          if (
            ElementApi.isElement(blockNode) &&
            state.nodes.isEmpty(blockNode)
          ) {
            const rules = getEffectiveDeleteRules(
              editor,
              'delete.empty',
              blockNode,
              blockPath
            );
            let handledRule = false;
            const ruleTransaction = state.transaction((tx) => {
              handledRule = executeDeleteRuleAction(
                editor,
                tx,
                rules?.empty,
                blockPath
              );
            });

            if (handledRule) return ruleTransaction;
          }
        }

        const documentStart = state.points.start([]);

        if (documentStart && PointApi.equals(selection.anchor, documentStart)) {
          return state.transaction((tx) => {
            resetBlock(editor, tx, [0]);
          });
        }

        return false;
      }),
    ],
    priority: -100,
    queries: {
      nodes: {
        shouldMergeNodesRemovePrevNode({ current, next, previous }) {
          const [previousNode, previousPath] = previous;
          const [, currentPath] = current;

          if (
            isRuntimeTextNode(previousNode) &&
            previousNode.text === '' &&
            previousPath.at(-1) !== 0
          ) {
            return true;
          }

          if (
            ElementApi.isElement(previousNode) &&
            getRuntimeNodeText(previousNode).length === 0 &&
            PathApi.isSibling(previousPath, currentPath)
          ) {
            return shouldRemoveEmptyMergeTarget(
              editor,
              previousNode,
              previousPath
            );
          }

          return next({ current, previous });
        },
      },
    },
    corrections: [
      {
        event: 'content',
        correct({ entry, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node) || typeof node.type !== 'string') {
            return;
          }

          const plugin = getPluginByType(editor, node.type);
          const normalizeRules = plugin?.rules.normalize;
          const overridePlugin = getRuleOverridePlugin(
            editor,
            'normalize.removeEmpty',
            node,
            path,
            (candidate) => !!candidate.rules?.normalize
          );
          const effectiveNormalizeRules =
            overridePlugin?.rules.normalize ?? normalizeRules;
          const text = getRuntimeNodeText(node);

          if (effectiveNormalizeRules?.removeEmpty && text.length === 0) {
            tx.nodes.remove({ at: path });
            return;
          }
        },
      },
    ],
  }),
});
