import type { Element } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';

import type { BaseEditor } from '../../editor';
import type { PluginConfig } from '../../plugin';

import { createBasePlugin, getEditorPlugin } from '../../plugin';

const isElementMetadataProp = (
  editor: BaseEditor,
  element: Element,
  key: string,
  value: unknown
) => {
  if (key === 'type') return true;

  return editor.runtime.pluginCache.node.isMetadataProp.some((pluginKey) => {
    const plugin = editor.plugins[pluginKey];

    return plugin.node.isMetadataProp?.({
      ...getEditorPlugin(editor, plugin),
      key,
      node: element,
      value,
    });
  });
};

export const isElementStateEmpty = (
  editor: BaseEditor,
  element: Element
): boolean =>
  !NodeApi.hasProps(element, {
    ignore: (key, value) => isElementMetadataProp(editor, element, key, value),
  });

export type ElementStateConfig = PluginConfig<
  'elementState',
  {},
  {
    isElementStateEmpty: (element: Element) => boolean;
  }
>;

export const ElementStatePlugin = createBasePlugin<ElementStateConfig>({
  key: 'elementState',
}).extendEditorApi<ElementStateConfig['api']>(({ editor }) => ({
  isElementStateEmpty: (element) => isElementStateEmpty(editor, element),
}));
