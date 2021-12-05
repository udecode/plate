import { PlateEditor } from '../../../types/PlateEditor';
import { AnyObject } from '../../../types/utility/AnyObject';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = <T = {}>(
  editor: PlateEditor<T>,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  [...editor.plugins].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtml(plugin, {
      element,
      deserializeLeaf: true,
    });
    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};
