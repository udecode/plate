import { type TElement, type TText, TextApi } from '@udecode/slate';
import kebabCase from 'lodash/kebabCase';

import type { SlateEditor } from '../../editor';

import { type AnyEditorPlugin, getEditorPlugin } from '../../plugin';

export const keyToDataAttribute = (key: string) => {
  return `data-slate-${kebabCase(key)}`;
};

export const getNodeDataAttributes = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin,
  node: TElement | TText
) => {
  const dataAttributes = Object.keys(node).reduce((acc, key) => {
    if (typeof node[key] === 'object') return acc;

    const isElement = plugin.node.isElement;

    const isLeaf = plugin.node.isLeaf;

    if (isElement && key === 'children') return acc;
    if (isLeaf && key === 'text') return acc;

    const attributeName = keyToDataAttribute(key);

    return {
      ...acc,
      [attributeName]: node[key],
    };
  }, {});

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
