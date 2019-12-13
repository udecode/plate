import React from 'react';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import {
  OnKeyDown,
  Plugin,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react';
import { HotKey } from 'plugins/common/constants';
import {
  ElementType,
  ListFormat,
  TextFormat,
} from 'plugins/common/constants/formats';
import { isFormatActive } from './queries';

export const withFormat = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    if (command.type === 'toggle_format') {
      const { format } = command;
      const isActive = isFormatActive(editor, format);
      const isList = Object.values(ListFormat).includes(format);

      if (Object.values(TextFormat).includes(format)) {
        Editor.setNodes(
          editor,
          { [format]: isActive ? null : true },
          { match: 'text', split: true }
        );
      }

      if (Object.values(ElementType).includes(format)) {
        Object.values(ListFormat).forEach(f => {
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
      }
    } else {
      exec(command);
    }
  };

  return editor;
};

// ?
const onDOMBeforeInputFormat = (event: any, editor: Editor) => {
  switch (event.inputType) {
    case 'formatBold':
      editor.exec({ type: 'toggle_format', format: TextFormat.BOLD });
      return true;
    case 'formatItalic':
      editor.exec({ type: 'toggle_format', format: TextFormat.ITALIC });
      return true;
    case 'formatUnderline':
      editor.exec({
        type: 'toggle_format',
        format: TextFormat.UNDERLINED,
      });
      return true;
    default:
      break;
  }
};

export const renderElementFormat = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ElementType.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case ElementType.HEADING_1:
      return <h1 {...attributes}>{children}</h1>;
    case ElementType.HEADING_2:
      return <h2 {...attributes}>{children}</h2>;
    case ElementType.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ElementType.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case ElementType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    default:
      break;
  }
};

export const renderLeafFormat = ({ children, leaf }: RenderLeafProps) => {
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

  return children;
};

export const onKeyDownFormat: OnKeyDown = (e, { editor }) => {
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
  onDOMBeforeInput: onDOMBeforeInputFormat,
  renderElement: renderElementFormat,
  renderLeaf: renderLeafFormat,
  onKeyDown: onKeyDownFormat,
});
