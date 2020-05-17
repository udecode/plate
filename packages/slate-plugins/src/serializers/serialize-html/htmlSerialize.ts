// import { SlatePlugin } from 'common/types';
import { Node as SlateNode, Text } from 'slate';
import {
  BLOCKQUOTE,
  HeadingType,
  IMAGE,
  LINK,
  ListType,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  PARAGRAPH,
  TableType,
} from '../..';

const escapeHtml = (rawHtml: string): string =>
  rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');

const getNode = ({ element, children }: { element: any; children: any }) => {
  switch (element.type) {
    case BLOCKQUOTE:
      // the plugin may have an optional parameter for the wrapping tag, default to blockquote
      return `<blockquote>${children}</blockquote>`;
    case PARAGRAPH:
      return `<p>${children}</p>`;
    case LINK:
      return `<a href="${escapeHtml(element.url)}">${children}</a>`;
    case HeadingType.H1:
      return `<h1>${children}</h1>`;
    case HeadingType.H2:
      return `<h2>${children}</h2>`;
    case ListType.OL:
      return `<ol>${children}</ol>`;
    case ListType.UL:
      return `<ul>${children}</ul>`;
    case ListType.LI:
      return `<li>${children}</li>`;
    case TableType.TABLE:
      return `<table>${children}</table>`;
    case IMAGE:
      return `<img src="${escapeHtml(element.url)}">${children}</img>`;
    default:
      return children;
  }
};

const getLeaf = ({ leaf, children }: { leaf: any; children: any }) => {
  let newChildren = children;
  if (leaf[MARK_BOLD]) {
    newChildren = `<strong>${newChildren}</strong>`;
  }
  if (leaf[MARK_ITALIC]) {
    newChildren = `<i>${newChildren}</i>`;
  }
  if (leaf[MARK_UNDERLINE]) {
    newChildren = `<u>${newChildren}</u>`;
  }
  return newChildren;
};

// should iterate over the plugins, see htmlDeserialize
export const htmlSerialize = (nodes: SlateNode[]): string =>
  nodes
    .map((node: any) => {
      if (Text.isText(node)) {
        return getLeaf({ leaf: node, children: node.text });
      }
      return getNode({ element: node, children: htmlSerialize(node.children) });
    })
    .join('');
