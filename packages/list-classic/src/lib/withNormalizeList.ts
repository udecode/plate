import {
  type OverrideEditor,
  type TElement,
  ElementApi,
  KEYS,
  match,
  NodeApi,
  PathApi,
} from 'platejs';

import type { ListConfig } from './BaseListPlugin';

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
      const liType = editor.getType(KEYS.li);
      const licType = editor.getType(KEYS.lic);
      const defaultType = editor.getType(KEYS.p);

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

        // add "checked" prop to list-item nodes if they have a tasklist parent but no "checked" prop
        // remove "checked" prop from list-item nodes if they do not have a tasklist parent but a "checked" prop
        if (node.type === editor.getType(KEYS.tasklist)) {
          const nonTasklistItems = Array.from(
            NodeApi.children(editor, path)
          ).filter(([child]) => child.type === liType && !('checked' in child));

          if (nonTasklistItems.length > 0) {
            return editor.tf.withoutNormalizing(() =>
              nonTasklistItems.forEach(([, itemPath]) => {
                editor.tf.setNodes({ checked: false }, { at: itemPath });
              })
            );
          }
        } else {
          const tasklistItems = Array.from(
            NodeApi.children(editor, path)
          ).filter(([child]) => child.type === liType && 'checked' in child);

          if (tasklistItems.length > 0) {
            return editor.tf.withoutNormalizing(() =>
              tasklistItems.forEach(([, itemPath]) => {
                editor.tf.unsetNodes('checked', { at: itemPath });
              })
            );
          }
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
        node.type === editor.getType(KEYS.li) &&
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
