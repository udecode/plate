import { type TElement, type TText, TextApi } from '@platejs/slate';
import kebabCase from 'lodash/kebabCase.js';

import type { SlateEditor } from '../../editor';

import { type AnyEditorPlugin, getEditorPlugin } from '../../plugin';

export const getNodeDataAttributes = (
  editor: SlateEditor,
  node: TElement | TText,
  {
    isElement,
    isLeaf,
    isText,
  }: { isElement?: boolean; isLeaf?: boolean; isText?: boolean }
) => {
  const dataAttributes = Object.keys(node).reduce((acc, key) => {
    if (typeof node[key] === 'object') return acc;
    if (isElement && key === 'children') return acc;
    if ((isLeaf || isText) && key === 'text') return acc;

    const plugin = editor.getPlugin({ key });

    if (isLeaf && plugin?.node.isLeaf && plugin?.node.isDecoration !== true) {
      return acc;
    }

    if (isText && plugin?.node.isLeaf && plugin?.node.isDecoration !== false) {
      return acc;
    }

    const attributeName = keyToDataAttribute(key);

    return { ...acc, [attributeName]: node[key] };
  }, {});

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

export const getNodeDataAttributeKeys = (node: TElement | TText) => {
  return Object.keys(node)
    .filter(
      (key) =>
        typeof node[key] !== 'object' &&
        (!TextApi.isText(node) || key !== 'text')
    )
    .map((key) => keyToDataAttribute(key));
};

export const keyToDataAttribute = (key: string) => {
  return `data-slate-${kebabCase(key)}`;
};
