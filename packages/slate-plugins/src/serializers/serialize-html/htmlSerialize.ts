import { ReactElement } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Node as SlateNode, Text } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { SlatePlugin } from '../..';

const getNode = (element: RenderElementProps, plugins: SlatePlugin[]) => {
  const { children } = element;
  const elementPlugin = plugins
    .filter((plugin) => plugin.renderElement)
    .find(
      ({ renderElement }) =>
        renderElement && renderElement(element) !== children
    );

  if (elementPlugin && elementPlugin.renderElement) {
    return ReactDOMServer.renderToStaticMarkup(
      elementPlugin.renderElement(element) as ReactElement
    );
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
  const result = nodes
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
      return getNode(
        {
          element: node,
          children: encodeURIComponent(htmlSerialize(plugins)(node.children)),
          attributes: { 'data-slate-node': 'element', ref: null },
        },
        plugins
      );
    })
    .join('');
  return decodeURIComponent(result);
};
