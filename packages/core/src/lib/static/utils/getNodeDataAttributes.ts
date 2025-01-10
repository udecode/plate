import type { TElement } from '@udecode/slate';

import kebabCase from 'lodash/kebabCase';

import type { AnyEditorPlugin } from '../../plugin';

export const getNodeDataAttributes = (
  plugin: AnyEditorPlugin,
  element: TElement
) => {
  const dataAttributes = plugin.node.toDataAttributes;

  if (!Array.isArray(dataAttributes)) return {};

  return dataAttributes.reduce((acc, attributeName) => {
    const keyName = `data-slate-${kebabCase(attributeName)}`;

    const value = element[attributeName] as string;
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);

    return {
      ...acc,
      [keyName]: jsonValue,
    };
  }, {});
};

export const getNodeDataAttributesKeys = (plugin: AnyEditorPlugin) => {
  const dataAttributes = plugin.node.toDataAttributes;

  if (!Array.isArray(dataAttributes)) return [];

  return dataAttributes.map(
    (attributeName) => `data-slate-${kebabCase(attributeName)}`
  );
};
