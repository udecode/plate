import {
  editorCommands,
  editorReads,
  ElementApi,
  NodeApi,
  PathApi,
  type Path,
  type Element,
} from '../../facade';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import { definePlugin } from '../../lib/plugin/definePlugin';
import { failInvariant } from '../failInvariant';
import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from './compilePlateModel';
import { insertExitBlock } from './insertExitBlock';
import type { StructuralRuleKey } from './plateRuntime';

type StructuralRuleValue = {
  'break.default': 'default' | 'deleteExit' | 'exit' | 'lineBreak' | 'none';
  'break.empty': 'default' | 'deleteExit' | 'exit' | 'lift' | 'none' | 'reset';
  'break.emptyLineEnd': 'default' | 'deleteExit' | 'exit';
  'break.splitReset': boolean;
  'delete.empty': 'default' | 'reset';
  'delete.start': 'default' | 'lift' | 'reset';
  'merge.removeEmpty': boolean;
  'normalize.removeEmpty': boolean;
};

/** Override the editor based on resolved Plate plugin node behavior. */
export const OverridePlugin = definePlugin('override', {}).extend(
  ({ editor }) => {
    const getRuleDecision = (plugin: AnyBasePlugin, key: StructuralRuleKey) => {
      const [family, action] = key.split('.') as [
        keyof typeof plugin.rules,
        string,
      ];
      const familyRules = plugin.rules[family] as
        | Record<string, unknown>
        | undefined;

      return familyRules?.[action];
    };
    const resolveStructuralRule = <TKey extends StructuralRuleKey>(
      key: TKey,
      node: Element,
      path: Path
    ): StructuralRuleValue[TKey] | undefined => {
      const typePlugin = getCompiledPlatePluginByType(editor, node.type);

      for (const name of getPlateRuntime(editor).pluginCache.rules[key]) {
        const plugin =
          getCompiledPlatePlugin(editor, name) ??
          failInvariant('Expected value to be defined');

        if (plugin.name === typePlugin?.name) continue;

        const decision = getRuleDecision(plugin, key);

        if (typeof decision !== 'function') continue;

        const value = Reflect.apply(decision, undefined, [
          {
            ...createPluginContext(editor, plugin),
            node,
            path,
          },
        ]) as StructuralRuleValue[TKey] | undefined;

        if (value !== undefined) return value;
      }

      if (!typePlugin) return undefined;

      const fallback = getRuleDecision(typePlugin, key);

      if (typeof fallback !== 'function') {
        return fallback as StructuralRuleValue[TKey] | undefined;
      }

      return Reflect.apply(fallback, undefined, [
        {
          ...createPluginContext(editor, typePlugin),
          node,
          path,
        },
      ]) as StructuralRuleValue[TKey] | undefined;
    };
    const shouldRemoveEmptyMergeTarget = (node: Element, path: Path) =>
      resolveStructuralRule('merge.removeEmpty', node, path) === true;

    return {
      commands: ({ around, handle }) => [
        around(editorCommands.insertBreak, ({ next, state }) => {
          const selection = state.selection();
          const block = selection
            ? state.nodes.block({ at: selection.focus })
            : undefined;

          if (!selection || !block) return next();

          const [blockNode, blockPath] = block;
          const runAction = (action: string | undefined) => {
            if (
              !action ||
              ![
                'none',
                'reset',
                'lineBreak',
                'lift',
                'exit',
                'deleteExit',
              ].includes(action) ||
              (action === 'lift' && blockPath.length === 0)
            ) {
              return null;
            }

            let handled = false;
            const transaction = state.transaction((tx) => {
              if (action === 'none') {
                handled = true;
                return;
              }
              if (action === 'reset') {
                tx.blocks.reset({ at: blockPath });
                handled = true;
                return;
              }
              if (action === 'lineBreak') {
                tx.break.insertSoft();
                handled = true;
                return;
              }
              if (action === 'lift') {
                tx.nodes.lift({ at: blockPath });
                handled = true;
                return;
              }
              if (action === 'deleteExit') {
                tx.text.deleteBackward({ unit: 'character' });
              }

              handled = insertExitBlock(tx);
            });

            return handled ? transaction : null;
          };

          if (state.selection.isCollapsed() && state.nodes.isEmpty(blockNode)) {
            const action = runAction(
              resolveStructuralRule('break.empty', blockNode, blockPath)
            );

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
            const action = runAction(
              resolveStructuralRule('break.emptyLineEnd', blockNode, blockPath)
            );

            if (action) return action;
          }

          const defaultAction = runAction(
            resolveStructuralRule('break.default', blockNode, blockPath)
          );

          if (defaultAction) return defaultAction;

          if (
            resolveStructuralRule('break.splitReset', blockNode, blockPath) ===
              true &&
            !state.selection.isAcrossBlocks()
          ) {
            const isAtStart = state.selection.isAtBlockStart();
            const result = next();

            if (result === false) return false;

            return state.transaction.extend(result, (tx) => {
              tx.blocks.reset({
                at: isAtStart ? blockPath : PathApi.next(blockPath),
              });
            });
          }

          return next();
        }),
        around(editorCommands.delete, ({ state, next }) => {
          const selection = state.selection();

          if (!selection || !state.selection.isCollapsed()) return next();

          const block = state.nodes.block({ at: selection.focus });

          if (!block) return next();

          const [blockNode, blockPath] = block;
          if (
            resolveStructuralRule('delete.empty', blockNode, blockPath) !==
            'reset'
          ) {
            return next();
          }

          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const nextSelection = tx.selection();
            const nextBlock = nextSelection
              ? tx.nodes.block({ at: nextSelection.focus })
              : undefined;

            if (
              nextBlock &&
              PathApi.equals(nextBlock[1], blockPath) &&
              tx.nodes.isEmpty(nextBlock[0])
            ) {
              tx.blocks.reset({ at: blockPath });
            }
          });
        }),
        handle(editorCommands.delete, ({ input, state }) => {
          const selectAdjacentBlockVoid = (
            adjacent: readonly [unknown, Path] | undefined,
            current: readonly [Element, Path]
          ) => {
            if (
              !adjacent ||
              !ElementApi.isElement(adjacent[0]) ||
              !state.schema.isVoid(adjacent[0])
            ) {
              return null;
            }
            const start = state.points.start(adjacent[1]);

            if (!start) return null;

            return state.transaction((tx) => {
              tx.selection.set(start);

              if (tx.nodes.isEmpty(current[0])) {
                tx.nodes.remove({ at: current[1] });
              }
            });
          };
          const runDeleteAction = (
            action: string | undefined,
            blockPath: Path
          ) => {
            if (
              action !== 'reset' &&
              !(action === 'lift' && blockPath.length > 0)
            ) {
              return null;
            }

            return state.transaction((tx) => {
              if (action === 'reset') tx.blocks.reset({ at: blockPath });
              else tx.nodes.lift({ at: blockPath });
            });
          };
          const selection = state.selection();

          if (!selection || !state.selection.isCollapsed()) {
            return false;
          }

          const block = state.nodes.block({ at: selection.focus });

          if (input.direction === 'forward') {
            if (block && state.points.isEnd(selection.anchor, block[1])) {
              const transaction = selectAdjacentBlockVoid(
                state.nodes.next({ at: block[1] }),
                block
              );

              if (transaction) return transaction;
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

              const selectAdjacent = selectAdjacentBlockVoid(previous, [
                blockNode,
                blockPath,
              ]);

              if (selectAdjacent) return selectAdjacent;

              const ruleTransaction = runDeleteAction(
                resolveStructuralRule('delete.start', blockNode, blockPath),
                blockPath
              );

              if (ruleTransaction) return ruleTransaction;
            }

            if (
              ElementApi.isElement(blockNode) &&
              state.nodes.isEmpty(blockNode)
            ) {
              const ruleTransaction = runDeleteAction(
                resolveStructuralRule('delete.empty', blockNode, blockPath),
                blockPath
              );

              if (ruleTransaction) return ruleTransaction;
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

            const text = NodeApi.string(node);

            if (
              resolveStructuralRule('normalize.removeEmpty', node, path) ===
                true &&
              text.length === 0
            ) {
              tx.nodes.remove({ at: path });
            }
          },
        },
      ],
    };
  }
);
