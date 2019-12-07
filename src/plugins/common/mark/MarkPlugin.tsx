import React from 'react';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { Plugin, RenderMarkProps } from 'slate-react';
import { CommonMark } from './CommonMark';

export const MARK_HOTKEYS: any = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underlined',
  'mod+`': 'code',
};

export const withMark = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'toggle_mark') {
      const { mark: type } = command;
      const isActive = CommonMark.isMarkActive(editor, type);
      const cmd = isActive ? 'remove_mark' : 'add_mark';
      editor.exec({ type: cmd, mark: { type } });
      return;
    }

    exec(command);
  };

  return editor;
};

export const MarkRender = ({ attributes, children, mark }: RenderMarkProps) => {
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>;
    case 'code':
      return <code {...attributes}>{children}</code>;
    case 'italic':
      return <em {...attributes}>{children}</em>;
    case 'underlined':
      return <u {...attributes}>{children}</u>;
    default:
      break;
  }
};

export const MarkOnKeyDown = (e: any, editor: Editor) => {
  for (const hotkey of Object.keys(MARK_HOTKEYS)) {
    if (isHotkey(hotkey, e)) {
      e.preventDefault();
      editor.exec({
        type: 'toggle_mark',
        mark: MARK_HOTKEYS[hotkey],
      });
    }
  }
};

export const MarkPlugin = (): Plugin => ({
  editor: withMark,
  renderMark: MarkRender,
  onKeyDown: MarkOnKeyDown,
});
