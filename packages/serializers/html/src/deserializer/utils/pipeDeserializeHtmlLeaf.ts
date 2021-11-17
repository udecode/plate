import { AnyObject, PlateEditor } from '@udecode/plate-core';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = <T = {}>(
  editor: PlateEditor<T>,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  editor.plugins.reverse().forEach((plugin) => {
    if (!plugin.isLeaf) return false;

    const deserialized = pluginDeserializeHtml(plugin, element);
    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};
