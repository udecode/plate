import type { TElement } from '@udecode/slate';

import kebabCase from 'lodash/kebabCase';

import type { SlateEditor } from '../../editor';

import { type AnyEditorPlugin, getEditorPlugin } from '../../plugin';

export const getNodeDataAttributes = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin,
  element: TElement
) => {
  const dataAttributes = Object.keys(element).reduce((acc, key) => {
    if (typeof element[key] === 'object') return acc;

    const attributeName = `data-slate-${kebabCase(key)}`;

    return {
      ...acc,
      [attributeName]: element[key],
    };
  }, {});

  const customAttributes =
    plugin.node.toDataAttributes?.({
      ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
      node: element,
    }) ?? {};

  return { ...dataAttributes, ...customAttributes };
};

export const getNodeDataAttributeKeys = (element: TElement) => {
  return Object.keys(element)
    .filter((key) => typeof element[key] !== 'object')
    .map((key) => `data-slate-${kebabCase(key)}`);
};
