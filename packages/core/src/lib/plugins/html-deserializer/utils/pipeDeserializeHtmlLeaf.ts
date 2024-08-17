import type { AnyObject } from '@udecode/utils';

import type { SlateEditor } from '../../../editor';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = (
  editor: SlateEditor,
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
