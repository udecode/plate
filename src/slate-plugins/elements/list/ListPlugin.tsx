import React from 'react';
import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common';
import { Plugin, RenderElementProps } from 'slate-react';
import { isBlockActive } from '../queries';

export enum ListType {
  OL_LIST = 'numbered-list',
  UL_LIST = 'bulleted-list',
  LIST_ITEM = 'list-item',
}

export const unwrapList = (editor: Editor) => {
  [ListType.OL_LIST, ListType.UL_LIST].forEach(f => {
    Editor.unwrapNodes(editor, { match: { type: f }, split: true });
  });
};

/**
 * Should be used after withBlock
 */
export const withList = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { format } = command;
    if (command.type === 'format_list') {
      const isActive = isBlockActive(editor, format);

      unwrapList(editor);

      Editor.setNodes(editor, {
        type: isActive ? ElementType.PARAGRAPH : ListType.LIST_ITEM,
      });

      if (!isActive) {
        Editor.wrapNodes(editor, { type: format, children: [] });
      }
    } else {
      if (command.type === 'format_block') {
        unwrapList(editor);
      }
      exec(command);
    }
  };

  return editor;
};

export const renderElementList = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ListType.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ListType.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case ListType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    default:
      break;
  }
};

export const ListPlugin = (): Plugin => ({
  editor: withList,
  renderElement: renderElementList,
});
