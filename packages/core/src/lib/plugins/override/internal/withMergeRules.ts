import {
  type Path,
  type Element,
  ElementApi,
  Editor as BasePlateEditorApi,
  type NodeEntry,
  PathApi,
  TextApi,
  type Value,
} from '@platejs/plite';

import type { LegacyTransformOverride } from '../../../../internal/plugin/withLegacyTransformOverride';
import type { MergeRules } from '../../../plugin/BasePlugin';

import { getPluginByType } from '../../../plugin/getEditorPluginInstance';

export const withMergeRules: LegacyTransformOverride = (ctx) => {
  const { editor, tf } = ctx;
  const { deleteBackward, deleteForward, removeNodes } = tf;

  const checkMatchRulesOverride = (
    rule: string,
    blockNode: any,
    blockPath: any
  ): MergeRules | null => {
    const matchRulesKeys = editor.meta.pluginCache.rules.match;
    for (const key of matchRulesKeys) {
      const overridePlugin = editor.getPlugin({ key });
      if (
        overridePlugin.rules.merge &&
        overridePlugin.rules?.match?.({
          ...ctx,
          node: blockNode,
          path: blockPath,
          rule: rule as any,
        })
      ) {
        return overridePlugin.rules.merge;
      }
    }
    return null;
  };

  return {
    api: {
      shouldMergeNodes(
        prevNodeEntry: NodeEntry,
        nextNodeEntry: NodeEntry,
        { reverse }: { reverse?: boolean } = {}
      ) {
        const [prevNode, prevPath] = prevNodeEntry;
        const [, nextPath] = nextNodeEntry;
        const [curNode, curPath] = reverse ? prevNodeEntry : nextNodeEntry;
        const [targetNode, targetPath] = reverse
          ? nextNodeEntry
          : prevNodeEntry;

        if (
          TextApi.isText(prevNode) &&
          prevNode.text === '' &&
          prevPath.at(-1) !== 0
        ) {
          tf.removeNodes({ at: prevPath });
          return false;
        }

        const shouldRemove = (node: Element, path: Path) => {
          // Override Plite's default: typically only pure text blocks like paragraph and heading nodes want this to be true, so plugin default is false.
          const plugin = getPluginByType(editor, node.type);
          if (!plugin) {
            return true;
          }

          const mergeRules = plugin.rules.merge;
          if (!mergeRules?.removeEmpty) {
            return false;
          }

          // Check if any plugin with matchRules overrides the merge behavior
          const overrideMergeRules = checkMatchRulesOverride(
            'merge.removeEmpty',
            node,
            path
          );

          if (overrideMergeRules?.removeEmpty === false) {
            return false;
          }

          return true;
        };

        // Don't delete target void blocks by default
        if (ElementApi.isElement(targetNode) && editor.api.isVoid(targetNode)) {
          // Remove if plugin allows it
          if (shouldRemove(targetNode, targetPath)) {
            tf.removeNodes({ at: prevPath });
          }
          // Remove current node if empty before selecting the void block
          else if (
            ElementApi.isElement(curNode) &&
            editor.api.isEmpty(curNode)
          ) {
            tf.removeNodes({ at: curPath });
          }
          return false;
        }

        // Not void, remove prevNode if sibling and empty
        if (
          ElementApi.isElement(prevNode) &&
          editor.api.isEmpty(prevNode) &&
          PathApi.isSibling(prevPath, nextPath) &&
          shouldRemove(prevNode, prevPath)
        ) {
          tf.removeNodes({ at: prevPath });
          return false;
        }

        return true;
      },
    },
    tf: {
      deleteBackward(unit) {
        if (handleDeleteBackwardBoundary()) return;

        deleteBackward(unit);
      },
      deleteForward(unit) {
        if (handleDeleteForwardBoundary()) return;

        deleteForward(unit);
      },
      removeNodes(options = {}) {
        const event = (options as { event?: { type?: string } }).event;

        if (event?.type === 'mergeNodes' && options.at) {
          const nodeEntry = editor.api.node(options.at);
          if (nodeEntry) {
            const [node, path] = nodeEntry;

            if (ElementApi.isElement(node)) {
              // Check if this node should be removed based on merge rules
              const plugin = getPluginByType(editor, node.type);
              if (plugin) {
                const mergeRules = plugin.rules.merge;

                // Check for override rules
                const overrideMergeRules = checkMatchRulesOverride(
                  'merge.removeEmpty',
                  node,
                  path
                );

                const shouldNotRemove =
                  overrideMergeRules?.removeEmpty === false ||
                  mergeRules?.removeEmpty === false;

                if (shouldNotRemove) {
                  // Don't remove the node, just return without calling removeNodes
                  return;
                }
              }
            }
          }
        }

        removeNodes(options);
      },
    },
  };

  function handleDeleteBackwardBoundary() {
    if (!editor.selection || !editor.api.isCollapsed()) return false;

    const block = editor.api.block();

    if (!block || !editor.api.isAt({ start: true })) return false;

    const [blockNode, blockPath] = block;
    const value = structuredClone(editor.children) as Value;
    const topLevelIndex = blockPath[0];

    if (topLevelIndex === undefined) return false;

    const previousTopLevelPath = [topLevelIndex - 1];
    const previousTopLevel = getNode(value, previousTopLevelPath);

    if (
      topLevelIndex > 0 &&
      ElementApi.isElement(previousTopLevel) &&
      editor.api.isVoid(previousTopLevel) &&
      ElementApi.isElement(blockNode) &&
      editor.api.isEmpty(blockNode)
    ) {
      removeNode(value, [topLevelIndex]);
      replaceValue(value, {
        anchor: { offset: 0, path: [...previousTopLevelPath, 0] },
        focus: { offset: 0, path: [...previousTopLevelPath, 0] },
      });
      return true;
    }

    if (
      topLevelIndex > 0 &&
      ElementApi.isElement(previousTopLevel) &&
      getNodeText(previousTopLevel).length === 0 &&
      PathApi.isSibling(previousTopLevelPath, [topLevelIndex]) &&
      !shouldRemove(previousTopLevel, previousTopLevelPath)
    ) {
      previousTopLevel.children = cloneChildren(blockNode);
      removeNode(value, [topLevelIndex]);
      replaceValue(value, {
        anchor: { offset: 0, path: [...previousTopLevelPath, 0] },
        focus: { offset: 0, path: [...previousTopLevelPath, 0] },
      });
      return true;
    }

    const currentTablePath = getTablePath(blockPath);

    if (
      currentTablePath &&
      isFirstCellBlockPath(value, currentTablePath, blockPath)
    ) {
      const previousBlock = getNode(value, [currentTablePath[0]! - 1] as Path);
      const firstCell = getFirstCell(value, currentTablePath);
      const firstCellText = getNodeText(firstCell);

      if (
        ElementApi.isElement(previousBlock) &&
        firstCell &&
        firstCellText.length > 0
      ) {
        const insertionOffset = appendText(previousBlock, firstCellText);

        clearCell(firstCell);
        replaceValue(value, {
          anchor: {
            offset: insertionOffset,
            path: [currentTablePath[0]! - 1, 0],
          },
          focus: {
            offset: insertionOffset,
            path: [currentTablePath[0]! - 1, 0],
          },
        });
        return true;
      }
    }

    if (
      ElementApi.isElement(previousTopLevel) &&
      previousTopLevel.type === 'table'
    ) {
      const lastCell = getLastCell(value, previousTopLevelPath);
      const text = getNodeText(blockNode);

      if (lastCell && text.length > 0 && getNodeText(lastCell).length === 0) {
        setCellText(lastCell, text);
        removeNode(value, [topLevelIndex]);
        replaceValue(value, {
          anchor: getCellStartPoint(value, previousTopLevelPath),
          focus: getCellStartPoint(value, previousTopLevelPath),
        });
        return true;
      }
    }

    return false;
  }

  function handleDeleteForwardBoundary() {
    if (!editor.selection || !editor.api.isCollapsed()) return false;

    const block = editor.api.block();

    if (!block || !editor.api.isAt({ end: true })) return false;

    const [blockNode, blockPath] = block;
    const value = structuredClone(editor.children) as Value;
    const clonedBlockNode = getNode(value, blockPath);
    const topLevelIndex = blockPath[0];

    if (topLevelIndex === undefined) return false;

    const nextTopLevelPath = [topLevelIndex + 1];
    const nextTopLevel = getNode(value, nextTopLevelPath);

    if (
      ElementApi.isElement(blockNode) &&
      ElementApi.isElement(nextTopLevel) &&
      getNodeText(blockNode).length === 0 &&
      ElementApi.isElement(clonedBlockNode) &&
      nextTopLevel.type === 'code_block'
    ) {
      const text = getNodeText(nextTopLevel);

      setElementText(clonedBlockNode, text);
      removeNode(value, nextTopLevelPath);
      replaceValue(value, {
        anchor: { offset: 0, path: [...blockPath, 0] },
        focus: { offset: 0, path: [...blockPath, 0] },
      });
      return true;
    }

    if (ElementApi.isElement(nextTopLevel) && nextTopLevel.type === 'table') {
      const firstCell = getFirstCell(value, nextTopLevelPath);
      const firstCellText = getNodeText(firstCell);

      if (
        firstCell &&
        firstCellText.length > 0 &&
        ElementApi.isElement(clonedBlockNode)
      ) {
        const insertionOffset = appendText(clonedBlockNode, firstCellText);

        clearCell(firstCell);
        replaceValue(value, {
          anchor: { offset: insertionOffset, path: [...blockPath, 0] },
          focus: { offset: insertionOffset, path: [...blockPath, 0] },
        });
        return true;
      }
    }

    return false;
  }

  function shouldRemove(node: Element, path: Path) {
    const plugin = getPluginByType(editor, node.type);

    if (!plugin) return true;

    const mergeRules = plugin.rules.merge;

    if (!mergeRules?.removeEmpty) return false;

    const overrideMergeRules = checkMatchRulesOverride(
      'merge.removeEmpty',
      node,
      path
    );

    return overrideMergeRules?.removeEmpty !== false;
  }

  function replaceValue(value: Value, selection: any) {
    BasePlateEditorApi.replace(editor, {
      children: value,
      selection,
    });
  }
};

const getNode = (value: Value, path: Path): any => {
  let node: any = value;

  for (const index of path) {
    node = node?.children?.[index] ?? node?.[index];
  }

  return node;
};

const getParentChildren = (value: Value, path: Path): any[] => {
  if (path.length === 1) return value as any[];

  return getNode(value, path.slice(0, -1))?.children ?? [];
};

const removeNode = (value: Value, path: Path) => {
  getParentChildren(value, path).splice(path.at(-1)!, 1);
};

const cloneChildren = (node: unknown) =>
  ElementApi.isElement(node) ? structuredClone(node.children) : [{ text: '' }];

const getNodeText = (node: unknown): string => {
  if (TextApi.isText(node)) return node.text;
  if (!ElementApi.isElement(node)) return '';

  return node.children.map(getNodeText).join('');
};

const findFirstText = (node: unknown): { node: any; path: number[] } | null => {
  if (TextApi.isText(node)) return { node, path: [] };
  if (!ElementApi.isElement(node)) return null;

  for (let index = 0; index < node.children.length; index++) {
    const found = findFirstText(node.children[index]);

    if (found) return { node: found.node, path: [index, ...found.path] };
  }

  return null;
};

const setElementText = (element: Element, text: string) => {
  element.children = [{ text }];
};

const appendText = (element: Element, text: string) => {
  const textEntry = findFirstText(element);
  const previousLength = textEntry?.node.text.length ?? 0;

  if (textEntry) {
    textEntry.node.text += text;
  } else {
    element.children = [{ text }];
  }

  return previousLength;
};

const getTablePath = (path: Path): Path | null => {
  if (path.length >= 3) return [path[0]!];

  return null;
};

const getFirstCell = (value: Value, tablePath: Path): Element | null => {
  const table = getNode(value, tablePath);
  const row = table?.children?.[0];
  const cell = row?.children?.[0];

  return ElementApi.isElement(cell) ? cell : null;
};

const getLastCell = (value: Value, tablePath: Path): Element | null => {
  const table = getNode(value, tablePath);
  const row = table?.children?.at(-1);
  const cell = row?.children?.at(-1);

  return ElementApi.isElement(cell) ? cell : null;
};

const clearCell = (cell: Element) => {
  cell.children = [{ text: '' }];
};

const setCellText = (cell: Element, text: string) => {
  cell.children = [{ text }];
};

const getCellStartPoint = (value: Value, tablePath: Path) => {
  const table = getNode(value, tablePath);
  const rowIndex = table?.children?.length ? table.children.length - 1 : 0;
  const row = table?.children?.[rowIndex];
  const cellIndex = row?.children?.length ? row.children.length - 1 : 0;

  return {
    offset: 0,
    path: [...tablePath, rowIndex, cellIndex, 0],
  };
};

const isFirstCellBlockPath = (value: Value, tablePath: Path, blockPath: Path) =>
  PathApi.equals(blockPath.slice(0, 3), [...tablePath, 0, 0]) &&
  getFirstCell(value, tablePath) !== null;
