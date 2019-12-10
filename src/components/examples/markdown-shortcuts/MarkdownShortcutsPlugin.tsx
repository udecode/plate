import React from 'react';
import { Editor, Point, Range } from 'slate';
import { Plugin, RenderElementProps } from 'slate-react';
import { BlockFormat } from 'plugins/common/constants/formats';

const SHORTCUTS: { [key: string]: string } = {
  '*': BlockFormat.LIST_ITEM,
  '-': BlockFormat.LIST_ITEM,
  '+': BlockFormat.LIST_ITEM,
  '>': BlockFormat.BLOCK_QUOTE,
  '#': BlockFormat.HEADING_1,
  '##': BlockFormat.HEADING_2,
  '###': BlockFormat.HEADING_3,
  '####': BlockFormat.HEADING_4,
  '#####': BlockFormat.HEADING_5,
  '######': BlockFormat.HEADING_6,
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

        if (type === BlockFormat.LIST_ITEM) {
          const list = { type: BlockFormat.UL_LIST, children: [] };
          Editor.wrapNodes(editor, list, {
            match: { type: BlockFormat.LIST_ITEM },
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
          block.type !== BlockFormat.PARAGRAPH &&
          Point.equals(selection.anchor, start)
        ) {
          Editor.setNodes(editor, { type: BlockFormat.PARAGRAPH });

          if (block.type === BlockFormat.LIST_ITEM) {
            Editor.unwrapNodes(editor, {
              match: { type: BlockFormat.UL_LIST },
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

export const renderElementShortcuts = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case BlockFormat.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case BlockFormat.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case BlockFormat.HEADING_1:
      return <h1 {...attributes}>{children}</h1>;
    case BlockFormat.HEADING_2:
      return <h2 {...attributes}>{children}</h2>;
    case BlockFormat.HEADING_3:
      return <h3 {...attributes}>{children}</h3>;
    case BlockFormat.HEADING_4:
      return <h4 {...attributes}>{children}</h4>;
    case BlockFormat.HEADING_5:
      return <h5 {...attributes}>{children}</h5>;
    case BlockFormat.HEADING_6:
      return <h6 {...attributes}>{children}</h6>;
    case BlockFormat.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    default:
      break;
  }
};

export const MarkdownShortcutsPlugin = (): Plugin => ({
  editor: withShortcuts,
  renderElement: renderElementShortcuts,
});
