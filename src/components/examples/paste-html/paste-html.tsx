import React, { useCallback, useMemo } from 'react';
import { css } from 'emotion';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { jsx } from 'slate-hyperscript';
import {
  RenderElementProps,
  RenderMarkProps,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { initialValue } from './config';

const ELEMENT_TAGS: any = {
  A: (el: any) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el: any) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
};

const MARK_TAGS: any = {
  CODE: () => ({ type: 'code' }),
  DEL: () => ({ type: 'strikethrough' }),
  EM: () => ({ type: 'italic' }),
  I: () => ({ type: 'italic' }),
  S: () => ({ type: 'strikethrough' }),
  STRONG: () => ({ type: 'bold' }),
  U: () => ({ type: 'underline' }),
};

export const deserialize = (el: any) => {
  if (el.nodeType === 3) {
    return el.textContent;
  }
  if (el.nodeType !== 1) {
    return null;
  }
  if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  let parent = el;

  if (
    el.nodeNode === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    [parent] = el.childNodes;
  }

  const children: any = Array.from(parent.childNodes).map(deserialize);

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (MARK_TAGS[nodeName]) {
    const attrs = MARK_TAGS[nodeName](el);
    return jsx('mark', attrs, children);
  }

  return children;
};

const withHtml = (editor: Editor) => {
  const { exec, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.exec = command => {
    if (command.type === 'insert_data') {
      const { data } = command;
      const html = data.getData('text/html');

      if (html) {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const fragment = deserialize(parsed.body);
        Editor.insertFragment(editor, fragment);
        return;
      }
    }

    exec(command);
  };

  return editor;
};

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>;
    case 'quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'code':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'link':
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      );
    case 'image':
      return <ImageElement {...props} />;
  }
};

const ImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        alt=""
        className={css`
          display: block;
          max-width: 100%;
          max-height: 20em;
          box-shadow: ${selected && focused ? '0 0 0 2px blue;' : 'none'};
        `}
      />
    </div>
  );
};

const Mark = ({ attributes, children, mark }: RenderMarkProps) => {
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>;
    case 'code':
      return <code {...attributes}>{children}</code>;
    case 'italic':
      return <em {...attributes}>{children}</em>;
    case 'underlined':
      return <u {...attributes}>{children}</u>;
    case 'strikethrough':
      return <del {...attributes}>{children}</del>;
    default:
      return <span {...attributes}>{children}</span>;
  }
};

export const PasteHtml = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderMark = useCallback(props => <Mark {...props} />, []);
  const editor = useMemo(
    () => withHtml(withReact(withHistory(createEditor()))),
    []
  );
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable
        renderElement={renderElement}
        renderMark={renderMark}
        placeholder="Paste in some HTML..."
      />
    </Slate>
  );
};
