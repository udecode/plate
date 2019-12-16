import React from 'react';
import { ElementType } from 'slate-plugins/common';
import { Plugin, RenderElementProps } from 'slate-react';

export const withwithBlockquote = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'format_block') {
      const { format } = command;
      const isActive = isBlockActive(editor, format);
      const isList = Object.values(ListType).includes(format);

      Object.values(ListType).forEach(f => {
        Editor.unwrapNodes(editor, { match: { type: f }, split: true });
      });

      Editor.setNodes(editor, {
        type: isActive
          ? ElementType.PARAGRAPH
          : isList
          ? ElementType.LIST_ITEM
          : format,
      });

      if (!isActive && isList) {
        Editor.wrapNodes(editor, { type: format, children: [] });
      }
    } else {
      exec(command);
    }
  };

  return editor;
};

export const renderElementBlockquote = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === ElementType.BLOCK_QUOTE) {
    return <blockquote {...attributes}>{children}</blockquote>;
  }
};

export const BlockquotePlugin = (): Plugin => ({
  renderElement: renderElementBlockquote,
});
