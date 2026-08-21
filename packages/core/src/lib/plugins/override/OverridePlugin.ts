import {
  editorCommands,
  editorReads,
  ElementApi,
  NodeApi,
  PathApi,
  type Path,
  type Element,
} from '@platejs/plite';

import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from '../../../internal/plugin/compilePlateModel';
import type { AnyBasePlugin } from '../../plugin/BasePlugin';
import { createPluginContext } from '../../plugin/createPluginContext.internal';
import { defineBasePlugin } from '../../plugin/defineBasePlugin';
import type { DefinitionOf, MatchRules } from '../../plugin/PluginDefinition';

export type OverridePluginUpdate = {
  executeBreakRuleAction: (
    action: string | undefined,
    blockPath: Path
  ) => boolean;
  executeDeleteRuleAction: (
    action: string | undefined,
    blockPath: Path
  ) => boolean;
  resetBlock: (at: Path) => void;
  selectAdjacentBlockVoid: (
    adjacent: readonly [unknown, Path] | undefined,
    current: readonly [Element, Path]
  ) => boolean;
};

/** Override the editor based on resolved Plate plugin node behavior. */
export const OverridePlugin = defineBasePlugin('override', {
  update: ({ tx }): OverridePluginUpdate => {
    const getDefaultBlock = () => {
      const defaultBlock = tx.schema.createDefaultRootChild();

      if (!ElementApi.isElement(defaultBlock)) {
        throw new Error(
          'Plate schema must declare a default primary-root element.'
        );
      }

      return defaultBlock;
    };
    const resetBlock = (at: Path) => {
      tx.blocks.reset(NodeApi.extractProps(getDefaultBlock()), { at });
    };
    const insertExitBreak = () => {
      const selection = tx.selection();

      if (!selection || !tx.selection.isCollapsed()) return false;

      const block = tx.nodes.block({ at: selection.focus });

      if (!block) return false;

      const defaultBlock = getDefaultBlock();
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

      tx.nodes.insert(defaultBlock, {
        at: PathApi.next(ancestorPath),
        select: true,
      });

      return true;
    };
    const executeBreakRuleAction = (
      action: string | undefined,
      blockPath: Path
    ) => {
      if (!action || action === 'default') return false;
      if (action === 'none') return true;
      if (action === 'reset') {
        resetBlock(blockPath);

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
      if (action === 'exit') return insertExitBreak();
      if (action === 'deleteExit') {
        tx.text.deleteBackward({ unit: 'character' });

        return insertExitBreak();
      }

      return false;
    };
    const executeDeleteRuleAction = (
      action: string | undefined,
      blockPath: Path
    ) => {
      if (action === 'reset') {
        resetBlock(blockPath);

        return true;
      }
      if (action === 'lift' && blockPath.length > 0) {
        tx.blocks.lift({ at: blockPath });

        return true;
      }

      return false;
    };
    const selectAdjacentBlockVoid = (
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

    return {
      executeBreakRuleAction,
      executeDeleteRuleAction,
      resetBlock,
      selectAdjacentBlockVoid,
    };
  },
}).extend(({ editor, plugin }) => {
  const getRuleOverridePlugin = (
    rule: MatchRules,
    node: Element,
    path: Path,
    hasRules: (plugin: AnyBasePlugin) => boolean
  ) => {
    for (const name of getPlateRuntime(editor).pluginCache.rules.match) {
      const plugin = getCompiledPlatePlugin(editor, name)!;
      const match = plugin?.rules?.match;

      if (
        plugin &&
        hasRules(plugin) &&
        typeof match === 'function' &&
        Reflect.apply(match, undefined, [
          {
            ...createPluginContext(editor, plugin),
            node,
            path,
            rule,
          },
        ])
      ) {
        return plugin;
      }
    }

    return null;
  };
  const getEffectiveBreakRules = (
    rule: MatchRules,
    blockNode: Element,
    blockPath: Path
  ) => {
    const plugin = getCompiledPlatePluginByType(editor, blockNode.type);
    const overridePlugin = getRuleOverridePlugin(
      rule,
      blockNode,
      blockPath,
      (candidate) => !!candidate.rules?.break
    );

    return overridePlugin?.rules.break ?? plugin?.rules?.break;
  };
  const getEffectiveDeleteRules = (
    rule: MatchRules,
    blockNode: Element,
    blockPath: Path
  ) => {
    const plugin = getCompiledPlatePluginByType(editor, blockNode.type);
    const overridePlugin = getRuleOverridePlugin(
      rule,
      blockNode,
      blockPath,
      (candidate) => !!candidate.rules?.delete
    );

    return overridePlugin?.rules.delete ?? plugin?.rules?.delete;
  };
  const shouldRemoveEmptyMergeTarget = (node: Element, path: Path) => {
    const type = typeof node.type === 'string' ? node.type : undefined;
    const plugin = type
      ? getCompiledPlatePluginByType(editor, type)
      : undefined;

    if (!plugin) return true;
    if (!plugin.rules?.merge?.removeEmpty) return false;

    for (const name of getPlateRuntime(editor).pluginCache.rules.match) {
      const overridePlugin = getCompiledPlatePlugin(editor, name)!;
      const match = overridePlugin?.rules?.match;

      if (
        overridePlugin?.rules?.merge &&
        typeof match === 'function' &&
        Reflect.apply(match, undefined, [
          {
            ...createPluginContext(editor, overridePlugin),
            node,
            path,
            rule: 'merge.removeEmpty',
          },
        ])
      ) {
        return overridePlugin.rules.merge.removeEmpty !== false;
      }
    }

    return true;
  };

  return {
    commands: ({ around, handle }) => [
      around(editorCommands.insertBreak, ({ next, state }) => {
        const selection = state.selection();
        const block = state.nodes.block();

        if (!selection || !block) return false;

        const [blockNode, blockPath] = block;
        const runAction = (action: string | undefined) => {
          let handled = false;
          const transaction = state.transaction((tx) => {
            handled = tx
              .plugin(plugin)
              .executeBreakRuleAction(action, blockPath);
          });

          return handled ? transaction : null;
        };

        if (state.selection.isCollapsed() && state.nodes.isEmpty(blockNode)) {
          const rules = getEffectiveBreakRules(
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
          (() => {
            const before = state.points.before(selection, {
              unit: 'character',
            });
            const range = before
              ? state.ranges.get(before, selection)
              : undefined;

            return range ? state.text.string(range) : '';
          })() === '\n'
        ) {
          const rules = getEffectiveBreakRules(
            'break.emptyLineEnd',
            blockNode,
            blockPath
          );
          const action = runAction(rules?.emptyLineEnd);

          if (action) return action;
        }

        const defaultRules = getEffectiveBreakRules(
          'break.default',
          blockNode,
          blockPath
        );
        const defaultAction = runAction(defaultRules?.default);

        if (defaultAction) return defaultAction;

        const splitResetRules = getEffectiveBreakRules(
          'break.splitReset',
          blockNode,
          blockPath
        );

        if (splitResetRules?.splitReset && !state.selection.isAcrossBlocks()) {
          const isAtStart = state.selection.isAtBlockStart();
          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            tx.plugin(plugin).resetBlock(
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
              handled = tx
                .plugin(plugin)
                .selectAdjacentBlockVoid(
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
              NodeApi.string(previous[0]).length === 0 &&
              !shouldRemoveEmptyMergeTarget(previous[0], previous[1])
            ) {
              return state.transaction((tx) => {
                tx.nodes.merge({ at: blockPath });
              });
            }

            let selectedAdjacent = false;
            const selectAdjacent = state.transaction((tx) => {
              selectedAdjacent = tx
                .plugin(plugin)
                .selectAdjacentBlockVoid(previous, [blockNode, blockPath]);
            });

            if (selectedAdjacent) return selectAdjacent;

            const rules = getEffectiveDeleteRules(
              'delete.start',
              blockNode,
              blockPath
            );
            let handledRule = false;
            const ruleTransaction = state.transaction((tx) => {
              handledRule = tx
                .plugin(plugin)
                .executeDeleteRuleAction(rules?.start, blockPath);
            });

            if (handledRule) return ruleTransaction;
          }

          if (
            ElementApi.isElement(blockNode) &&
            state.nodes.isEmpty(blockNode)
          ) {
            const rules = getEffectiveDeleteRules(
              'delete.empty',
              blockNode,
              blockPath
            );
            let handledRule = false;
            const ruleTransaction = state.transaction((tx) => {
              handledRule = tx
                .plugin(plugin)
                .executeDeleteRuleAction(rules?.empty, blockPath);
            });

            if (handledRule) return ruleTransaction;
          }
        }

        return false;
      }),
    ],
    readMiddleware: ({ around }) => [
      around(
        editorReads.nodes.shouldMergeNodesRemovePrevNode,
        ({ input: { current, previous }, next }) => {
          const [previousNode, previousPath] = previous;
          const [, currentPath] = current;

          if (
            NodeApi.isText(previousNode) &&
            previousNode.text === '' &&
            previousPath.at(-1) !== 0
          ) {
            return true;
          }

          if (
            ElementApi.isElement(previousNode) &&
            NodeApi.string(previousNode).length === 0 &&
            PathApi.isSibling(previousPath, currentPath)
          ) {
            return shouldRemoveEmptyMergeTarget(previousNode, previousPath);
          }

          return next();
        }
      ),
    ],
    corrections: [
      {
        event: 'content',
        correct({ entry, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node) || typeof node.type !== 'string') {
            return;
          }

          const plugin = getCompiledPlatePluginByType(editor, node.type);
          const normalizeRules = plugin?.rules.normalize;
          const overridePlugin = getRuleOverridePlugin(
            'normalize.removeEmpty',
            node,
            path,
            (candidate) => !!candidate.rules?.normalize
          );
          const effectiveNormalizeRules =
            overridePlugin?.rules.normalize ?? normalizeRules;
          const text = NodeApi.string(node);

          if (effectiveNormalizeRules?.removeEmpty && text.length === 0) {
            tx.nodes.remove({ at: path });
          }
        },
      },
    ],
  };
});

export type OverrideDefinition = DefinitionOf<typeof OverridePlugin>;
