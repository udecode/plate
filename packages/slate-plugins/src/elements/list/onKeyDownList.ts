import { Editor, Node, Path, Text, Transforms } from 'slate';
import { isBlockActive } from '../queries';
import { isList } from './queries';
import { ListType } from './types';

const isFirstChild = (path: Path): boolean => path[path.length - 1] === 0;

const isSelectionInList = (editor: Editor): boolean =>
  isBlockActive(editor, ListType.LIST_ITEM);

const isListItem = (node: Node) => node.type === ListType.LIST_ITEM;

export const onKeyDownList = () => (e: KeyboardEvent, editor: Editor) => {
  if (isSelectionInList(editor)) {
    if (e.key === 'Tab') {
      e.preventDefault();

      const currentItem = Editor.above(editor, {
        match: isListItem,
      });
      const currentList = Editor.above(editor, {
        match: isList,
      });

      if (currentItem && currentList) {
        const [, currentPath] = currentItem;
        const [currentListElem, currentListPath] = currentList;

        if (e.shiftKey) {
          const parentItem = Editor.above(editor, {
            at: currentListPath,
            match: isListItem,
          });

          if (parentItem) {
            const [, parentPath] = parentItem;

            // Move item one level up
            Transforms.moveNodes(editor, {
              at: currentPath,
              to: Path.next(parentPath),
            });

            // Remove sublist if this was the last element
            if (currentListElem.children.length === 1) {
              Transforms.removeNodes(editor, {
                at: currentListPath,
              });
            }
          }
        } else if (!isFirstChild(currentPath)) {
          // Previous sibling is the new parent
          const previousSiblingItem = Editor.node(
            editor,
            Path.previous(currentPath)
          );

          if (previousSiblingItem) {
            const [previousElem, previousPath] = previousSiblingItem;

            // All children must be blocks - move to normalization?
            previousElem.children.forEach((n: any, idx: number) => {
              if (Text.isText(n)) {
                Transforms.wrapNodes(
                  editor,
                  { type: 'paragraph', children: [] },
                  { at: previousPath.concat(idx) }
                );
              }
            });

            const sublist = previousElem.children.find(isList);
            const newPath = previousPath.concat(
              sublist ? [1, sublist.children.length] : [1]
            );

            if (!sublist) {
              // Create new sublist
              Transforms.wrapNodes(
                editor,
                { type: currentListElem.type, children: [] },
                { at: currentPath }
              );
            }

            // Move the current item to the sublist
            Transforms.moveNodes(editor, {
              at: currentPath,
              to: newPath,
            });
          }
        }
      }
    }
  }
};
