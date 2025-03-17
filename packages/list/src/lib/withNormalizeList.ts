import {
  type OverrideEditor,
  type TElement,
  BaseParagraphPlugin,
  ElementApi,
  match,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import {
  type ListConfig,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
} from './BaseListPlugin';
import { normalizeListItem } from './normalizers/normalizeListItem';
import { normalizeNestedList } from './normalizers/normalizeNestedList';
import { getListTypes, isListRoot } from './queries';
import { moveListItemsToList } from './transforms';

/** Normalize list node to force the ul>li>p+ul structure. */
export const withNormalizeList: OverrideEditor<ListConfig> = ({
  editor,
  getOptions,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode([node, path]) {
      const liType = editor.getType(BaseListItemPlugin);
      const licType = editor.getType(BaseListItemContentPlugin);
      const defaultType = editor.getType(BaseParagraphPlugin);

      if (!ElementApi.isElement(node)) {
        return normalizeNode([node, path]);
      }
      if (isListRoot(editor, node)) {
        const nonLiChild = Array.from(NodeApi.children(editor, path)).find(
          ([child]) => child.type !== liType
        );

        if (nonLiChild) {
          return editor.tf.wrapNodes<TElement>(
            { children: [], type: liType },
            { at: nonLiChild[1] }
          );
        }
      }
      // remove empty list
      if (match(node, [], { type: getListTypes(editor) })) {
        if (
          node.children.length === 0 ||
          !node.children.some((item) => item.type === liType)
        ) {
          return editor.tf.removeNodes({ at: path });
        }

        const nextPath = PathApi.next(path);
        const nextNode = NodeApi.get<TElement>(editor, nextPath)!;

        // Has a list afterwards with the same type
        if (nextNode?.type === node.type) {
          moveListItemsToList(editor, {
            deleteFromList: true,
            fromList: [nextNode, nextPath],
            toList: [node, path],
          });
        }

        const prevPath = PathApi.previous(path)!;
        const prevNode = NodeApi.get<TElement>(editor, prevPath);

        // Has a list before with the same type
        if (prevNode?.type === node.type) {
          editor.tf.normalizeNode([prevNode, prevPath]);

          // early return since this node will no longer exists
          return;
        }
        if (normalizeNestedList(editor, { nestedListItem: [node, path] })) {
          return;
        }
      }
      if (
        node.type === editor.getType(BaseListItemPlugin) &&
        normalizeListItem(editor, {
          listItem: [node, path],
          validLiChildrenTypes: getOptions().validLiChildrenTypes,
        })
      ) {
        return;
      }
      // LIC should have LI parent. If not, set LIC to DEFAULT type.
      if (
        node.type === licType &&
        licType !== defaultType &&
        editor.api.parent(path)?.[0].type !== liType
      ) {
        editor.tf.setNodes({ type: defaultType }, { at: path });

        return;
      }

      normalizeNode([node, path]);
    },
  },
});
