import { type Path, type TElement, ElementApi, TextApi } from '@udecode/slate';

import type { OverrideEditor } from '../../plugin';
import type { MergeRules } from '../../plugin/BasePlugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withMergeRules: OverrideEditor = (ctx) => {
  const { editor } = ctx;

  const checkMatchRulesOverride = (
    rule: string,
    blockNode: any,
    blockPath: any
  ): MergeRules | null => {
    const matchRulesKeys = editor.meta.pluginCache.node.matchRules;
    for (const key of matchRulesKeys) {
      const overridePlugin = editor.getPlugin({ key }).node;
      if (
        overridePlugin.mergeRules &&
        overridePlugin.matchRules?.({
          ...ctx,
          node: blockNode,
          path: blockPath,
          rule: rule as any,
        })
      ) {
        return overridePlugin.mergeRules;
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

          const mergeRules = plugin.node.mergeRules;
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
