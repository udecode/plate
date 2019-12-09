import React from 'react';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { Plugin, RenderElementProps, RenderLeafProps } from 'slate-react';
import { HotKey } from 'plugins/common/constants';
import {
  BlockFormat,
  ListFormat,
  TextFormat,
} from 'plugins/common/constants/formats';
import { FormatElement } from './FormatElement';

export const withFormat = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'toggle_format') {
      const { format } = command;
      const isActive = FormatElement.isFormatActive(editor, format);
      const isList = Object.values(ListFormat).includes(format);

      if (Object.values(TextFormat).includes(format)) {
        Editor.setNodes(
          editor,
          { [format]: isActive ? null : true },
          { match: 'text', split: true }
        );
      }

      if (Object.values(BlockFormat).includes(format)) {
        Object.values(ListFormat).forEach(f => {
          Editor.unwrapNodes(editor, { match: { type: f }, split: true });
        });

        Editor.setNodes(editor, {
          type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        });

        if (!isActive && isList) {
          Editor.wrapNodes(editor, { type: format, children: [] });
        }
      }
    } else {
      exec(command);
    }
  };

  return editor;
};

export const renderElementFormat = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const renderLeafFormat = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underlined) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export const onKeyDownFormat = (e: any, editor: Editor) => {
  for (const hotkey of Object.keys(HotKey)) {
    if (isHotkey(hotkey, e)) {
      e.preventDefault();
      editor.exec({
        type: 'toggle_format',
        format: HotKey[hotkey],
      });
    }
  }
};

export const FormatPlugin = (): Plugin => ({
  editor: withFormat,
  renderElement: renderElementFormat,
  renderLeaf: renderLeafFormat,
  onKeyDown: onKeyDownFormat,
});
