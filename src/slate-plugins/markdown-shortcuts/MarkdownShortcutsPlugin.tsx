import { Editor, Point, Range } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { ListType } from 'slate-plugins/elements';
import { Plugin } from 'slate-react';

const SHORTCUTS: { [key: string]: string } = {
  '*': ListType.LIST_ITEM,
  '-': ListType.LIST_ITEM,
  '+': ListType.LIST_ITEM,
  '>': ElementType.BLOCK_QUOTE,
  '#': ElementType.HEADING_1,
  '##': ElementType.HEADING_2,
  '###': ElementType.HEADING_3,
  '####': ElementType.HEADING_4,
  '#####': ElementType.HEADING_5,
  '######': ElementType.HEADING_6,
};

export const withShortcuts = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { selection } = editor;

    if (
      command.type === 'insert_text' &&
      command.text === ' ' &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const { anchor } = selection;
      const [block] = Editor.nodes(editor, { match: 'block' });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.text(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Editor.select(editor, range);
        Editor.delete(editor);
        Editor.setNodes(editor, { type }, { match: 'block' });

        if (type === ListType.LIST_ITEM) {
          const list = { type: ListType.UL_LIST, children: [] };
          Editor.wrapNodes(editor, list, {
            match: { type: ListType.LIST_ITEM },
          });
        }

        return;
      }
    }

    if (
      command.type === 'delete_backward' &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const [match] = Editor.nodes(editor, { match: 'block' });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== ElementType.PARAGRAPH &&
          Point.equals(selection.anchor, start)
        ) {
          Editor.setNodes(editor, { type: ElementType.PARAGRAPH });

          if (block.type === ListType.LIST_ITEM) {
            Editor.unwrapNodes(editor, {
              match: { type: ListType.UL_LIST },
            });
          }

          return;
        }
      }
    }

    exec(command);
  };

  return editor;
};

export const MarkdownShortcutsPlugin = (): Plugin => ({
  editor: withShortcuts,
});
