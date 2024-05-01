import type { Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from '../../../types/PlateEditor';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = <V extends Value>(
  editor: PlateEditor<V>,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  [...editor.plugins].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtml(editor, plugin, {
      deserializeLeaf: true,
      element,
    });

    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};
