import { Editor, NodeEntry, Path, Text, Transforms } from 'slate';
import { isBlockActive } from '../queries';
import { isList } from './queries';
import { ListType } from './types';

const previousSibling = (
  editor: Editor,
  type: string,
  siblingPath: Path,
  lastPath: Path
): NodeEntry | undefined => {
  const previousItem = Editor.previous(editor, {
    match: n => n.type === type,
    at: lastPath,
  });

  if (!previousItem) {
    return undefined;
  }

  const [, previousPath] = previousItem;

  if (Path.isSibling(previousPath, siblingPath)) {
    return previousItem;
  }

  return previousSibling(editor, type, siblingPath, previousPath);
};

/*
  TODO - handle enter in paragraph in list item?

  TODO - check if list exists before adding?

  TODO - bug in sibling fn?
 */

export const onKeyDownList = () => (e: KeyboardEvent, editor: Editor) => {
  if (isBlockActive(editor, ListType.LIST_ITEM)) {
    if (e.key === 'Tab') {
      e.preventDefault();

      const currentItem = Editor.above(editor, {
        match: n => n.type === ListType.LIST_ITEM,
      });
      const currentList = Editor.above(editor, {
        match: isList,
      });

      if (currentItem && currentList) {
        const [currentElement, currentPath] = currentItem;
        const [currentListElem, currentListPath] = currentList;

        if (e.shiftKey) {
          const parentItem = Editor.above(editor, {
            at: currentListPath,
            match: n => n.type === ListType.LIST_ITEM,
          });

          if (parentItem) {
            const [, parentPath] = parentItem;

            Transforms.moveNodes(editor, {
              at: currentPath,
              to: Path.next(parentPath),
            });

            if (currentListElem.children.length === 1) {
              Transforms.removeNodes(editor, {
                at: currentListPath,
              });
            }
          }
        } else {
          const previousSiblingItem = previousSibling(
            editor,
            ListType.LIST_ITEM,
            currentPath,
            currentPath
          );

          if (previousSiblingItem) {
            const [previousElem, previousPath] = previousSiblingItem;
            Transforms.removeNodes(editor, { at: currentPath });
            previousElem.children.forEach((n: any, idx: number) => {
              if (Text.isText(n)) {
                Transforms.wrapNodes(
                  editor,
                  { type: 'paragraph', children: [] },
                  { at: previousPath.concat(idx) }
                );
              }
            });
            Transforms.insertNodes(
              editor,
              {
                type: currentListElem.type,
                children: [currentElement],
              },
              {
                at: previousPath.concat(previousElem.children.length),
                select: true,
              }
            );
          }
        }
      }
    }
  }
};
