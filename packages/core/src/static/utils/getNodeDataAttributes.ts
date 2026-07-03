import type { Element, Text } from '@platejs/plite';
import { keyToDataAttribute } from '@platejs/plite-dom/internal';

import {
  type AnyBasePlugin,
  type BaseEditor,
  getEditorPlugin,
} from '../../lib';

export const getNodeDataAttributes = (
  editor: BaseEditor,
  node: Element | Text,
  {
    isElement,
    isLeaf,
    isText,
  }: { isElement?: boolean; isLeaf?: boolean; isText?: boolean }
): Record<string, unknown> => {
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
    {} as Record<string, unknown>
  );

  return dataAttributes;
};

export const getPluginDataAttributes = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  node: Element
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
      ...getEditorPlugin(editor, plugin),
      node,
    }) ?? {};

  return { ...dataAttributes, ...customAttributes };
};
