import {
  type Path,
  type Element,
  ElementApi,
  type NodeEntry,
  PathApi,
  TextApi,
} from '@platejs/slate';

import type { LegacyTransformOverride } from '../../../../internal/plugin/withLegacyTransformOverride';
import type { MergeRules } from '../../../plugin/BasePlugin';

import { getPluginByType } from '../../../plugin/getSlatePlugin';

export const withMergeRules: LegacyTransformOverride = (ctx) => {
  const { editor, tf } = ctx;
  const { removeNodes } = tf;

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
          // Override Slate's default: typically only pure text blocks like paragraph and heading nodes want this to be true, so plugin default is false.
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
      removeNodes(options = {}) {
        if (options.event?.type === 'mergeNodes' && options.at) {
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
};
