import {
  editorCommands,
  editorReads,
  ElementApi,
  NodeApi,
  PathApi,
  type Path,
  type Element,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from '../../../internal/plugin/compilePlateModel';
import type { AnyBasePlugin } from '../../plugin/BasePlugin';
import { createPluginContext } from '../../plugin/createPluginContext.internal';
import { defineBasePlugin } from '../../plugin/defineBasePlugin';
import type { DefinitionOf, MatchRules } from '../../plugin/PluginDefinition';

/** Override the editor based on resolved Plate plugin node behavior. */
export const OverridePlugin = defineBasePlugin('override', {}).extend(
  ({ editor }) => {
    const getRuleOverridePlugin = (
      rule: MatchRules,
      node: Element,
      path: Path,
      hasRules: (plugin: AnyBasePlugin) => boolean
    ) => {
      for (const name of getPlateRuntime(editor).pluginCache.rules.match) {
        const innerPlugin =
          getCompiledPlatePlugin(editor, name) ??
          failInvariant('Expected value to be defined');
        const match = innerPlugin?.rules?.match;

        if (
          innerPlugin &&
          hasRules(innerPlugin) &&
          typeof match === 'function' &&
          Reflect.apply(match, undefined, [
            {
              ...createPluginContext(editor, innerPlugin),
              node,
              path,
              rule,
            },
          ])
        ) {
          return innerPlugin;
        }
      }

      return null;
    };
    const getEffectiveBreakRules = (
      rule: MatchRules,
      blockNode: Element,
      blockPath: Path
    ) => {
      const innerPlugin2 = getCompiledPlatePluginByType(editor, blockNode.type);
      const overridePlugin = getRuleOverridePlugin(
        rule,
        blockNode,
        blockPath,
        (candidate) => !!candidate.rules?.break
      );

      return overridePlugin?.rules.break ?? innerPlugin2?.rules?.break;
    };
    const getEffectiveDeleteRules = (
      rule: MatchRules,
      blockNode: Element,
      blockPath: Path
    ) => {
      const innerPlugin3 = getCompiledPlatePluginByType(editor, blockNode.type);
      const overridePlugin = getRuleOverridePlugin(
        rule,
        blockNode,
        blockPath,
        (candidate) => !!candidate.rules?.delete
      );

      return overridePlugin?.rules.delete ?? innerPlugin3?.rules?.delete;
    };
    const shouldRemoveEmptyMergeTarget = (node: Element, path: Path) => {
      const type = typeof node.type === 'string' ? node.type : undefined;
      const innerPlugin4 = type
        ? getCompiledPlatePluginByType(editor, type)
        : undefined;

      if (!innerPlugin4) return false;
      if (!innerPlugin4.rules?.merge?.removeEmpty) return false;

      for (const name of getPlateRuntime(editor).pluginCache.rules.match) {
        const overridePlugin =
          getCompiledPlatePlugin(editor, name) ??
          failInvariant('Expected value to be defined');
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
          const block = selection
            ? state.nodes.block({ at: selection.focus })
            : undefined;

          if (!selection || !block) return false;

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

              const exitSelection = tx.selection();

              if (!exitSelection || !tx.selection.isCollapsed()) return;

              const exitBlock = tx.nodes.block({ at: exitSelection.focus });

              if (!exitBlock) return;

              const defaultBlock = tx.schema.createDefaultRootChild();

              if (!ElementApi.isElement(defaultBlock)) {
                throw new Error(
                  'Plate schema must declare a default primary-root element.'
                );
              }
              const target = tx.nodes.above({
                at: exitBlock[1],
                match: (node, path) =>
                  path.length === 1 ||
                  (path.length > 1 &&
                    ElementApi.isElement(node) &&
                    typeof node.type === 'string' &&
                    tx.schema.findWrapping(node, defaultBlock)?.length === 0),
              });
              const ancestorPath = target?.[1] ?? exitBlock[1];

              tx.nodes.insert(defaultBlock, {
                at: PathApi.next(ancestorPath),
                select: true,
              });
              handled = true;
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

          if (
            splitResetRules?.splitReset &&
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

          return false;
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

              const rules = getEffectiveDeleteRules(
                'delete.start',
                blockNode,
                blockPath
              );
              const ruleTransaction = runDeleteAction(rules?.start, blockPath);

              if (ruleTransaction) return ruleTransaction;
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
              const ruleTransaction = runDeleteAction(rules?.empty, blockPath);

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

            const innerPlugin5 = getCompiledPlatePluginByType(
              editor,
              node.type
            );
            const normalizeRules = innerPlugin5?.rules.normalize;
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
  }
);

export type OverrideDefinition = DefinitionOf<typeof OverridePlugin>;
