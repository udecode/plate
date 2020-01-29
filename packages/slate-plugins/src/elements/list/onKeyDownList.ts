import { Editor, Path, Transforms } from 'slate';
import { isBlockActive } from '../queries';
import { isList } from './queries';
import { ListType } from './types';

export const onKeyDownList = () => (e: KeyboardEvent, editor: Editor) => {
  if (isBlockActive(editor, ListType.LIST_ITEM)) {
    if (e.key === 'Tab') {
      e.preventDefault();

      const previousItem = Editor.previous(editor, {
        match: n => n.type === ListType.LIST_ITEM,
      });
      const currentItem = Editor.above(editor, {
        match: n => n.type === ListType.LIST_ITEM,
      });
      const currentList = Editor.above(editor, {
        match: isList,
      });

      console.log("elem", currentItem);
      console.log("list", currentList);
      console.log("prev", previousItem);

      if (e.shiftKey) {
        console.log('shift+tab pressed');
      } else {
        console.log('tab pressed');
        if (
          previousItem &&
          currentItem &&
          Path.isSibling(previousItem[1], currentItem[1])
        ) {
          Transforms.insertNodes(
            editor,
            // @ts-ignore
            [
              {
                type: currentList && currentList[0].type,
                children: [currentItem],
              },
            ],
            {
              at: previousItem[1].concat([previousItem[0].children.length + 1]),
            }
          );
          console.log('valid item!');
        }
      }
    }
  }
};
