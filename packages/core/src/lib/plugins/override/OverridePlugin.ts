import {
  ElementApi,
  OperationApi,
  PathApi,
  PointApi,
  type EditorElementSpec,
  type EditorUpdateTransaction,
  type Element,
  type Operation,
} from '@platejs/plite';
import {
  getEditorDefaultBlockType,
  getOperationRoot,
  MAIN_ROOT_KEY,
} from '@platejs/plite/internal';

import type { BaseEditor } from '../../editor/SlateEditor';
import type { AnyBasePlugin } from '../../plugin/BasePlugin';
import type { MatchRules } from '../../plugin/SlatePlugin';

import { createBasePlugin } from '../../plugin/createBasePlugin';
import { getEditorPlugin } from '../../plugin/getEditorPlugin';
import { getPluginByType } from '../../plugin/getSlatePlugin';

const resetBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  at: number[]
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
  path: number[],
  hasRules: (plugin: AnyBasePlugin) => boolean
) => {
  for (const key of editor.runtime.pluginCache.rules.match) {
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

const insertExitBreak = (editor: BaseEditor, tx: EditorUpdateTransaction) => {
  const selection = editor.read.selection();

  if (!selection) return false;
  if (!editor.read.selection.isCollapsed()) return false;

  const block = editor.read.nodes.block({ at: selection.focus });

  if (!block) return false;

  const target = editor.read.nodes.above({
    at: block[1],
    match: (node, path) =>
      path.length === 1 ||
      (path.length > 1 &&
        ElementApi.isElement(node) &&
        typeof node.type === 'string' &&
        !getPluginByType(editor, node.type)?.node.isStrictSiblings),
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
  tx: EditorUpdateTransaction,
  action: string | undefined,
  blockPath: number[]
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
  tx: EditorUpdateTransaction,
  action: string | undefined,
  blockPath: number[]
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

const getEffectiveBreakRules = (
  editor: BaseEditor,
  rule: MatchRules,
  blockNode: Element,
  blockPath: number[]
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
  blockPath: number[]
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

const getPreviousCharacter = (editor: BaseEditor) => {
  const selection = editor.read.selection();
  const before = selection
    ? editor.read.points.before(selection, { unit: 'character' })
    : undefined;

  if (!selection || !before) return '';

  const range = editor.read.ranges.get(before, selection);

  return range ? editor.read.text.string(range) : '';
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

const getRuntimeDescendant = (
  editor: BaseEditor,
  path: number[],
  root?: string
) => {
  try {
    const rootValue = editor.read((state) =>
      root === undefined || root === MAIN_ROOT_KEY
        ? state.children()
        : state.root(root)
    );
    let node: unknown = rootValue;

    for (const index of path) {
      const children = getRuntimeChildren(node);

      if (!children?.[index]) return;

      node = children[index];
    }

    return node;
  } catch {
    return;
  }
};

const getMergeOverrideRules = (
  editor: BaseEditor,
  rule: MatchRules,
  node: Element,
  path: number[]
) => {
  for (const key of editor.runtime.pluginCache.rules.match) {
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
  path: number[]
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

const getMergeNodeProperties = (node: { children: unknown[] }) => {
  const { children: _children, ...properties } = node;

  return properties;
};

/** Override the editor based on resolved Plate plugin node behavior. */
export const OverridePlugin = createBasePlugin({
  key: 'override',
})
  .extendExtension(({ editor }) => {
    const elements = editor.runtime.pluginList.flatMap((plugin) => {
      const { node } = plugin;
      const type = node?.type;

      if (!type) return [];

      const hasSchemaBehavior =
        node.isInline !== undefined ||
        node.isMarkableVoid !== undefined ||
        node.isSelectable !== undefined ||
        node.isVoid !== undefined;

      if (!hasSchemaBehavior) return [];

      const spec: EditorElementSpec = { type };

      if (node.isInline === true) {
        spec.inline = true;
      }
      if (node.isSelectable === false) {
        spec.selectable = false;
      }
      if (node.isMarkableVoid === true) {
        spec.markableVoid = true;
      }
      if (node.isVoid === true) {
        spec.void =
          node.isInline === true
            ? node.isMarkableVoid === true
              ? 'markable-inline'
              : 'inline'
            : 'block';
      }

      return [spec];
    });

    if (elements.length === 0) return;

    return { elements };
  })
  .extendExtension(({ editor }) => {
    const hasBreakRules = editor.runtime.pluginList.some(
      (plugin) => plugin.rules?.break || plugin.rules?.match
    );

    if (!hasBreakRules) return;

    return {
      transforms: {
        insertBreak({ next, tx }) {
          const selection = editor.read.selection();
          const block = editor.read.nodes.block();

          if (!selection || !block) return next();

          const [blockNode, blockPath] = block;

          if (
            editor.read.selection.isCollapsed() &&
            editor.read.nodes.isEmpty(blockNode)
          ) {
            const rules = getEffectiveBreakRules(
              editor,
              'break.empty',
              blockNode,
              blockPath
            );

            if (executeBreakRuleAction(editor, tx, rules?.empty, blockPath)) {
              return true;
            }
          }

          if (
            editor.read.selection.isCollapsed() &&
            !editor.read.nodes.isEmpty(blockNode) &&
            editor.read.points.isEnd(selection.anchor, blockPath) &&
            getPreviousCharacter(editor) === '\n'
          ) {
            const rules = getEffectiveBreakRules(
              editor,
              'break.emptyLineEnd',
              blockNode,
              blockPath
            );

            if (
              executeBreakRuleAction(editor, tx, rules?.emptyLineEnd, blockPath)
            ) {
              return true;
            }
          }

          const defaultRules = getEffectiveBreakRules(
            editor,
            'break.default',
            blockNode,
            blockPath
          );

          if (
            executeBreakRuleAction(editor, tx, defaultRules?.default, blockPath)
          ) {
            return true;
          }

          const splitResetRules = getEffectiveBreakRules(
            editor,
            'break.splitReset',
            blockNode,
            blockPath
          );

          if (
            splitResetRules?.splitReset &&
            !editor.read.points.isStart(selection.anchor, blockPath) &&
            !editor.read.points.isEnd(selection.anchor, blockPath)
          ) {
            tx.break.insert();
            resetBlock(editor, tx, PathApi.next(blockPath));
            return true;
          }

          return next();
        },
      },
    };
  })
  .extendExtension(({ editor }) => {
    const hasDeleteBehavior = editor.runtime.pluginList.some(
      (plugin) =>
        plugin.node.isVoid || plugin.rules?.delete || plugin.rules?.match
    );

    if (!hasDeleteBehavior) return;

    return {
      transforms: {
        deleteBackward({ next, tx, unit }) {
          const selection = editor.read.selection();

          if (!selection || !editor.read.selection.isCollapsed()) {
            return next({ unit });
          }

          const block = editor.read.nodes.block();

          if (block) {
            const [blockNode, blockPath] = block;

            if (editor.read.points.isStart(selection.anchor, blockPath)) {
              const previous = editor.read.nodes.previous({ at: blockPath });

              if (
                previous &&
                ElementApi.isElement(previous[0]) &&
                editor.read.schema.isVoid(previous[0])
              ) {
                tx.selection.set(
                  editor.read.points.start(previous[1], { required: true })
                );
                return true;
              }

              const rules = getEffectiveDeleteRules(
                editor,
                'delete.start',
                blockNode,
                blockPath
              );

              if (
                executeDeleteRuleAction(editor, tx, rules?.start, blockPath)
              ) {
                return true;
              }
            }

            if (
              ElementApi.isElement(blockNode) &&
              editor.read.nodes.isEmpty(blockNode)
            ) {
              const rules = getEffectiveDeleteRules(
                editor,
                'delete.empty',
                blockNode,
                blockPath
              );

              if (
                executeDeleteRuleAction(editor, tx, rules?.empty, blockPath)
              ) {
                return true;
              }
            }
          }

          const documentStart = editor.read.points.start([], {
            required: true,
          });

          if (PointApi.equals(selection.anchor, documentStart)) {
            resetBlock(editor, tx, [0]);
            return true;
          }

          return next({ unit });
        },
      },
    };
  })
  .extendExtension(({ editor }) => {
    const hasMergeRules = editor.runtime.pluginList.some(
      (plugin) => plugin.rules?.merge || plugin.rules?.match
    );

    if (!hasMergeRules) return;

    return {
      operations: {
        apply({ operation, next }) {
          if (
            OperationApi.isRemoveNodeOperation(operation) &&
            ElementApi.isElement(operation.node) &&
            !editor.read.schema.isVoid(operation.node) &&
            operation.node.children.length > 0 &&
            operation.path.length > 0 &&
            getRuntimeNodeText(operation.node).length === 0 &&
            !shouldRemoveEmptyMergeTarget(
              editor,
              operation.node,
              operation.path
            )
          ) {
            const operationExplicitRoot =
              'root' in operation ? operation.root : undefined;
            const nextPath = PathApi.next(operation.path);
            const nextNode = getRuntimeDescendant(
              editor,
              nextPath,
              getOperationRoot(operation)
            );

            if (ElementApi.isElement(nextNode)) {
              for (
                let index = operation.node.children.length - 1;
                index >= 0;
                index--
              ) {
                const removeChildOperation = {
                  node: operation.node.children[index],
                  path: [...operation.path, index],
                  root: operationExplicitRoot,
                  type: 'remove_node',
                } satisfies Operation;

                next(removeChildOperation);
              }

              const mergeNextOperation = {
                path: nextPath,
                position: 0,
                properties: getMergeNodeProperties(nextNode),
                root: operationExplicitRoot,
                type: 'merge_node',
              } satisfies Operation;

              next(mergeNextOperation);
              return;
            }
          }

          next(operation);
        },
      },
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
    };
  })
  .extendExtension(({ editor }) => {
    const hasNormalizeRules = editor.runtime.pluginList.some(
      (plugin) => plugin.rules?.normalize || plugin.rules?.match
    );

    if (!hasNormalizeRules) return;

    return {
      normalizers: {
        node({ entry, next, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node) || typeof node.type !== 'string') {
            next();
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
          const text = editor.read.text.string(path);

          if (effectiveNormalizeRules?.removeEmpty && text.length === 0) {
            tx.nodes.remove({ at: path });
            return;
          }

          next();
        },
      },
    };
  });
