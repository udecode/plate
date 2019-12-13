import React from 'react';
import isUrl from 'is-url';
import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { Plugin, RenderElementProps } from 'slate-react';
import { wrapLink } from './commands';

export const withLink = (editor: Editor) => {
  const { exec, isInline } = editor;

  editor.isInline = element => {
    return element.type === ElementType.LINK ? true : isInline(element);
  };

  editor.exec = command => {
    if (command.type === 'insert_link') {
      const { url } = command;

      if (editor.selection) {
        wrapLink(editor, url);
      }

      return;
    }

    let text;

    if (command.type === 'insert_data') {
      text = command.data.getData('text/plain');
    } else if (command.type === 'insert_text') {
      text = command.text;
    }

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      exec(command);
    }
  };

  return editor;
};

export const renderElementLink = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ElementType.LINK:
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    default:
      break;
  }
};

export const LinkPlugin = (): Plugin => ({
  editor: withLink,
  renderElement: renderElementLink,
});
