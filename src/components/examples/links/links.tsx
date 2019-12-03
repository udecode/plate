/* eslint-disable no-alert */
import React, { useMemo } from 'react';
import isUrl from 'is-url';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { RenderElementProps, useSlate, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { Button, Icon, Toolbar } from '../../components';
import { initialValue } from './config';

const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, { match: { type: 'link' } });
  return !!link;
};

const unwrapLink = (editor: Editor) => {
  Editor.unwrapNodes(editor, { match: { type: 'link' } });
};

const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const link = { type: 'link', url, children: [] };
  Editor.wrapNodes(editor, link, { split: true });
  Editor.collapse(editor, { edge: 'end' });
};

const withLinks = (editor: Editor) => {
  const { exec, isInline } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
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

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'link':
      return (
        <a
          {...attributes}
          href={element.url}
          style={{ border: '1px solid red', padding: '5px', margin: '5px' }}
        >
          {children}
        </a>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const LinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        editor.exec({ type: 'insert_link', url });
      }}
    >
      <Icon>link</Icon>
    </Button>
  );
};

export const Links = () => {
  const editor = useMemo(
    () => withLinks(withHistory(withReact(createEditor()))),
    []
  );
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Toolbar>
        <LinkButton />
      </Toolbar>
      <Editable
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  );
};
