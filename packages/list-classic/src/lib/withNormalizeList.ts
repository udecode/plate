import type { ExtendPlateEditorExtension } from '@platejs/core';
import { type Element, ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from './BaseListPlugin';

import { normalizeListItem } from './normalizers/normalizeListItem';
import { normalizeNestedList } from './normalizers/normalizeNestedList';
import { getListTypes, isListRoot } from './queries';
import { moveListItemsToList } from './transforms';

/** Normalize list nodes to the ul > li > p + ul structure. */
export const withNormalizeList: ExtendPlateEditorExtension<ListConfig> = ({
  editor,
  getOptions,
}) => ({
  normalizers: {
    node({ entry: [node, path], next, tx }) {
      if (!ElementApi.isElement(node)) {
        next();
        return;
      }

      const liType = editor.getType(KEYS.li);
      const licType = editor.getType(KEYS.lic);
      const defaultType = editor.getType(KEYS.p);
      const listTypes = getListTypes(editor);

      if (isListRoot(editor, node)) {
        const nonLiChildIndex = node.children.findIndex(
          (child) => !ElementApi.isElement(child) || child.type !== liType
        );

        if (nonLiChildIndex !== -1) {
          const child = node.children[nonLiChildIndex];
          const childPath = [...path, nonLiChildIndex];

          if (
            ElementApi.isElement(child) &&
            isListRoot(editor, child) &&
            normalizeNestedList(editor, tx, {
              nestedListItem: [child, childPath],
            })
          ) {
            return;
          }

          tx.nodes.wrap({ children: [], type: liType }, { at: childPath });
          return;
        }

        const taskList = node.type === editor.getType(KEYS.taskList);

        for (const [index, child] of node.children.entries()) {
          if (!ElementApi.isElement(child) || child.type !== liType) continue;

          if (taskList && !Object.hasOwn(child, 'checked')) {
            tx.nodes.set({ checked: false }, { at: [...path, index] });
            return;
          }
          if (!taskList && Object.hasOwn(child, 'checked')) {
            tx.nodes.unset('checked', { at: [...path, index] });
            return;
          }
        }
      }

      if (listTypes.includes(node.type)) {
        if (
          node.children.length === 0 ||
          !node.children.some(
            (item) => ElementApi.isElement(item) && item.type === liType
          )
        ) {
          tx.nodes.remove({ at: path });
          return;
        }

        const nextPath = PathApi.next(path);
        const nextNode = editor.read.nodes.get<Element>(nextPath);

        if (nextNode?.[0].type === node.type) {
          moveListItemsToList(editor, tx, {
            deleteFromList: true,
            fromList: nextNode,
            toList: [node, path],
          });
          return;
        }

        if (PathApi.hasPrevious(path)) {
          const prevNode = editor.read.nodes.get<Element>(
            PathApi.previous(path)
          );

          if (prevNode?.[0].type === node.type) {
            moveListItemsToList(editor, tx, {
              deleteFromList: true,
              fromList: [node, path],
              toList: prevNode,
            });
            return;
          }
        }

        if (normalizeNestedList(editor, tx, { nestedListItem: [node, path] })) {
          return;
        }
      }

      if (
        node.type === liType &&
        normalizeListItem(editor, tx, {
          listItem: [node, path],
          validLiChildrenTypes: getOptions().validLiChildrenTypes,
        })
      ) {
        return;
      }

      const parent = editor.read.nodes.parent<Element>(path);

      if (
        node.type === licType &&
        licType !== defaultType &&
        parent?.[0].type !== liType
      ) {
        tx.nodes.set({ type: defaultType }, { at: path });
        return;
      }

      next();
    },
  },
});
