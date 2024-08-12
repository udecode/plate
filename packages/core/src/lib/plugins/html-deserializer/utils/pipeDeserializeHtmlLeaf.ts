import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from '../../../editor';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = (
  editor: PlateEditor,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  [...editor.pluginList].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtml(editor, plugin, {
      deserializeLeaf: true,
      element,
    });

    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};
