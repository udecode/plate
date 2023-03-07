import { AnyObject, Value } from '@udecode/slate';
import { PlateEditor } from '../../../types/PlateEditor';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  [...editor.plugins].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtml(editor, plugin, {
      element,
      deserializeLeaf: true,
    });
    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};
