import { Value } from '../../../../../slate-utils/src/slate/editor/TEditor';
import { AnyObject } from '../../../../../slate-utils/src/types/misc/AnyObject';
import { PlateEditor } from '../../../types/plate/PlateEditor';
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
