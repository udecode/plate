import ReactDOMServer from 'react-dom/server';
import { Node as SlateNode, Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import {
  BLOCKQUOTE,
  HeadingType,
  IMAGE,
  LINK,
  ListType,
  PARAGRAPH,
  SlatePlugin,
  TableType,
} from '../..';

const escapeHtml = (a: string): string => a;

const getNode = ({
  element,
  children,
}: {
  element: SlateNode;
  children: string;
}) => {
  switch (element.type) {
    case BLOCKQUOTE:
      return `<blockquote>${children}</blockquote>`;
    case PARAGRAPH:
      return `<p>${children}</p>`;
    case LINK:
      return `<a href="${escapeHtml(element.url as string)}">${children}</a>`;
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
      return `<img src="${escapeHtml(
        element.url as string
      )}">${children}</img>`;
    default:
      return children;
  }
};

const getLeaf = (leafProps: RenderLeafProps, plugins: SlatePlugin[]) => {
  const { children } = leafProps;
  const leafPlugin = plugins
    .filter((plugin) => plugin.renderLeaf)
    .find(({ renderLeaf }) => renderLeaf && renderLeaf(leafProps) !== children);
  if (leafPlugin && leafPlugin.renderLeaf) {
    return ReactDOMServer.renderToStaticMarkup(
      leafPlugin.renderLeaf(leafProps)
    );
  }
  return children;
};

export const htmlSerialize = (plugins: SlatePlugin[]) => (
  nodes: SlateNode[]
): string => {
  return nodes
    .map((node: SlateNode) => {
      if (Text.isText(node)) {
        return getLeaf(
          {
            leaf: node as Text,
            text: node as Text,
            children: node.text,
            attributes: { 'data-slate-leaf': true },
          },
          plugins
        );
      }
      return getNode({
        element: node,
        children: htmlSerialize(plugins)(node.children),
      });
    })
    .join('');
};
