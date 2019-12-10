import React from 'react';
import { Editor } from 'slate';
import { jsx } from 'slate-hyperscript';
import { Plugin, RenderElementProps, RenderLeafProps } from 'slate-react';
import { BlockFormat, InlineFormat } from 'plugins/common/constants/formats';
import { ImageElement } from './ImageElement';

const ELEMENT_TAGS: any = {
  A: (el: any) => ({ type: InlineFormat.LINK, url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: BlockFormat.BLOCK_QUOTE }),
  H1: () => ({ type: BlockFormat.HEADING_1 }),
  H2: () => ({ type: BlockFormat.HEADING_2 }),
  H3: () => ({ type: BlockFormat.HEADING_3 }),
  H4: () => ({ type: BlockFormat.HEADING_4 }),
  H5: () => ({ type: BlockFormat.HEADING_5 }),
  H6: () => ({ type: BlockFormat.HEADING_6 }),
  IMG: (el: any) => ({ type: BlockFormat.IMAGE, url: el.getAttribute('src') }),
  LI: () => ({ type: BlockFormat.LIST_ITEM }),
  OL: () => ({ type: BlockFormat.OL_LIST }),
  P: () => ({ type: BlockFormat.PARAGRAPH }),
  PRE: () => ({ type: BlockFormat.CODE }),
  UL: () => ({ type: BlockFormat.UL_LIST }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: any = {
  CODE: () => ({ code: true }),
  KBD: () => ({ code: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  DEL: () => ({ strikethrough: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
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
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    [parent] = el.childNodes;
  }

  const children: any[] = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }

  return children;
};

export const withPasteHtml = (editor: Editor) => {
  const { exec, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === InlineFormat.LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === BlockFormat.IMAGE ? true : isVoid(element);
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

export const renderElementPasteHtml = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case BlockFormat.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case BlockFormat.CODE:
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
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
    case BlockFormat.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case InlineFormat.LINK:
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    case BlockFormat.IMAGE:
      return <ImageElement {...props} />;
    default:
      break;
  }
};

export const renderLeafPasteHtml = ({ children, leaf }: RenderLeafProps) => {
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

  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }

  return children;
};

export const PasteHtmlPlugin = (): Plugin => ({
  editor: withPasteHtml,
  renderElement: renderElementPasteHtml,
  renderLeaf: renderLeafPasteHtml,
});
