import { type Path, type TElement, ElementApi, TextApi } from '@udecode/slate';

import type { OverrideEditor } from '../../plugin';
import type { MergeMode } from '../../plugin/BasePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withMergeMode: OverrideEditor = (ctx) => {
  const { editor } = ctx;

  const checkMatchModeOverride = (
    mode: string,
    blockNode: any,
    blockPath: any
  ): MergeMode | null => {
    const matchModeKeys = editor.meta.pluginKeys.node.matchMode;
    for (const key of matchModeKeys) {
      const overridePlugin = editor.getPlugin({ key }).node;
      if (
        overridePlugin.mergeMode &&
        overridePlugin.matchMode?.({
          ...ctx,
          mode: mode as any,
          node: blockNode,
          path: blockPath,
        })
      ) {
        return overridePlugin.mergeMode;
      }
    }
    return null;
  };

  return {
    api: {
      shouldMergeNodes(prevNodeEntry, nextNodeEntry, { reverse } = {}) {
        const [prevNode, prevPath] = prevNodeEntry;
        const [curNode, curPath] = reverse ? prevNodeEntry : nextNodeEntry;
        const [targetNode, targetPath] = reverse
          ? nextNodeEntry
          : prevNodeEntry;

        if (
          TextApi.isText(prevNode) &&
          prevNode.text === '' &&
          prevPath.at(-1) !== 0
        ) {
          editor.tf.removeNodes({ at: prevPath });
          return false;
        }

        const shouldRemove = (node: TElement, path: Path) => {
          // Override Slate's default: typically only pure text blocks like paragraph and heading nodes want this to be true, so plugin default is false.
          const plugin = getPluginByType(editor, node.type);
          if (!plugin) {
            return true;
          }

          const mergeMode = plugin.node.mergeMode;
          if (!mergeMode?.removeEmpty) {
            return false;
          }

          // Check if any plugin with matchMode overrides the merge behavior
          const overrideMergeMode = checkMatchModeOverride(
            'merge.removeEmpty',
            node,
            path
          );

          if (overrideMergeMode?.removeEmpty === false) {
            return false;
          }

          return true;
        };

        // Don't delete target void blocks by default
        if (ElementApi.isElement(targetNode) && editor.api.isVoid(targetNode)) {
          // Remove if plugin allows it
          if (shouldRemove(targetNode, targetPath)) {
            editor.tf.removeNodes({ at: prevPath });
          }
          // Remove current node if empty before selecting the void block
          else if (
            ElementApi.isElement(curNode) &&
            editor.api.isEmpty(curNode)
          ) {
            editor.tf.removeNodes({ at: curPath });
          }
          return false;
        }

        // Not void, remove prevNode if empty
        if (
          ElementApi.isElement(prevNode) &&
          editor.api.isEmpty(prevNode) &&
          shouldRemove(prevNode, prevPath)
        ) {
          editor.tf.removeNodes({ at: prevPath });
          return false;
        }

        return true;
      },
    },
  };
};
