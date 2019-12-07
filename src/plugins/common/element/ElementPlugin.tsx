import React from 'react';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { Plugin, RenderElementProps } from 'slate-react';
import { BLOCKS } from '../constants';
import { CommonElement } from './CommonElement';

const BLOCKS_HOTKEYS: any = {
  'mod+g': BLOCKS.HEADING_1,
  // 'mod+i': 'italic',
  // 'mod+u': 'underlined',
  // 'mod+`': 'code',
};

export const withBlock = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'toggle_block') {
      const { block: type } = command;
      const isActive = CommonElement.isBlockActive(editor, type);
      const isListType = type === 'bulleted-list' || type === 'numbered-list';
      Editor.unwrapNodes(editor, {
        match: { type: 'bulleted-list' },
        split: true,
      });

      Editor.unwrapNodes(editor, {
        match: { type: 'numbered-list' },
        split: true,
      });

      const newType = isActive ? 'paragraph' : isListType ? 'list-item' : type;
      Editor.setNodes(editor, { type: newType });

      if (!isActive && isListType) {
        Editor.wrapNodes(editor, { type, children: [] });
      }

      return;
    }

    exec(command);
  };

  return editor;
};

export const BlockRender = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case BLOCKS.HEADING_1:
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    default:
      break;
  }
};

export const BlockOnKeyDown = (e: any, editor: Editor) => {
  for (const hotkey of Object.keys(BLOCKS_HOTKEYS)) {
    if (isHotkey(hotkey, e)) {
      e.preventDefault();
      editor.exec({
        type: 'toggle_block',
        block: BLOCKS_HOTKEYS[hotkey],
      });
    }
  }
};

export const BlockPlugin = (): Plugin => ({
  editor: withBlock,
  renderElement: BlockRender,
  onKeyDown: BlockOnKeyDown,
});
