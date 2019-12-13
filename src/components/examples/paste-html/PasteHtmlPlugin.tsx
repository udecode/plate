import React from 'react';
import { Editor } from 'slate';
import { jsx } from 'slate-hyperscript';
import { Plugin, RenderElementProps, RenderLeafProps } from 'slate-react';
import { ElementType } from 'plugins/common/constants/formats';
import { ImageElement } from './ImageElement';

const ELEMENT_TAGS: any = {
  A: (el: any) => ({ type: ElementType.LINK, url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: ElementType.BLOCK_QUOTE }),
  H1: () => ({ type: ElementType.HEADING_1 }),
  H2: () => ({ type: ElementType.HEADING_2 }),
  H3: () => ({ type: ElementType.HEADING_3 }),
  H4: () => ({ type: ElementType.HEADING_4 }),
  H5: () => ({ type: ElementType.HEADING_5 }),
  H6: () => ({ type: ElementType.HEADING_6 }),
  IMG: (el: any) => ({ type: ElementType.IMAGE, url: el.getAttribute('src') }),
  LI: () => ({ type: ElementType.LIST_ITEM }),
  OL: () => ({ type: ElementType.OL_LIST }),
  P: () => ({ type: ElementType.PARAGRAPH }),
  PRE: () => ({ type: ElementType.CODE }),
  UL: () => ({ type: ElementType.UL_LIST }),
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
    return element.type === ElementType.LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === ElementType.IMAGE ? true : isVoid(element);
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
    case ElementType.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case ElementType.CODE:
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    case ElementType.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ElementType.HEADING_1:
      return <h1 {...attributes}>{children}</h1>;
    case ElementType.HEADING_2:
      return <h2 {...attributes}>{children}</h2>;
    case ElementType.HEADING_3:
      return <h3 {...attributes}>{children}</h3>;
    case ElementType.HEADING_4:
      return <h4 {...attributes}>{children}</h4>;
    case ElementType.HEADING_5:
      return <h5 {...attributes}>{children}</h5>;
    case ElementType.HEADING_6:
      return <h6 {...attributes}>{children}</h6>;
    case ElementType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case ElementType.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case ElementType.LINK:
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    case ElementType.IMAGE:
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
