import type { Element, Text } from '@platejs/plite';
import { keyToDataAttribute } from '@platejs/plite-dom/internal';

import {
  type AnyBasePlugin,
  type BaseEditor,
  getEditorPlugin,
} from '../../lib';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
} from '../../internal/plugin/compilePlateModel';

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

      const plugin = getCompiledPlatePlugin(editor, key);

      const binding = plugin
        ? getCompiledPlateModelBinding(editor, plugin)
        : undefined;

      if (isLeaf && binding?.kind === 'mark' && !binding.isDecoration) {
        return acc;
      }

      if (isText && binding?.kind === 'mark' && binding.isDecoration) {
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
  const binding = getCompiledPlateModelBinding(editor, plugin);
  const isElement = binding?.kind === 'element';
  const isLeaf = binding?.kind === 'mark' && binding.isDecoration;
  const isText = binding?.kind === 'mark' && !binding.isDecoration;

  const dataAttributes = getNodeDataAttributes(editor, node, {
    isElement,
    isLeaf,
    isText,
  });
  const customAttributes =
    plugin.host.toDataAttributes?.({
      ...getEditorPlugin(editor, plugin),
      node,
    }) ?? {};

  return { ...dataAttributes, ...customAttributes };
};
