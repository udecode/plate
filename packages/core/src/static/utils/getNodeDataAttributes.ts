import type { TElement, TText } from '@platejs/slate';

import {
  type AnyEditorPlugin,
  type SlateEditor,
  getEditorPlugin,
  keyToDataAttribute,
} from '../../lib';

export const getNodeDataAttributes = (
  editor: SlateEditor,
  node: TElement | TText,
  {
    isElement,
    isLeaf,
    isText,
  }: { isElement?: boolean; isLeaf?: boolean; isText?: boolean }
) => {
  const dataAttributes = Object.keys(node).reduce(
    (acc, key) => {
      if (typeof node[key] === 'object') return acc;
      if (isElement && key === 'children') return acc;
      if ((isLeaf || isText) && key === 'text') return acc;

      const plugin = editor.getPlugin({ key });

      if (isLeaf && plugin?.node.isLeaf && plugin?.node.isDecoration !== true) {
        return acc;
      }

      if (
        isText &&
        plugin?.node.isLeaf &&
        plugin?.node.isDecoration !== false
      ) {
        return acc;
      }

      const attributeName = keyToDataAttribute(key);

      acc[attributeName] = node[key];
      return acc;
    },
    {} as Record<string, any>
  );

  return dataAttributes;
};

export const getPluginDataAttributes = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin,
  node: TElement | TText
) => {
  const isElement = plugin.node.isElement;
  const isLeaf = plugin.node.isLeaf && plugin.node.isDecoration === true;
  const isText = plugin.node.isLeaf && plugin.node.isDecoration === false;

  const dataAttributes = getNodeDataAttributes(editor, node, {
    isElement,
    isLeaf,
    isText,
  });

  const customAttributes =
    plugin.node.toDataAttributes?.({
      ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
      node,
    }) ?? {};

  return { ...dataAttributes, ...customAttributes };
};
