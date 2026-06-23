import type { AnyObject } from '@udecode/utils';

import type { BasePlateEditor } from '../../../editor';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = (
  editor: BasePlateEditor,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  [...editor.meta.pluginList].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtml(editor, plugin, {
      deserializeLeaf: true,
      element,
    });

    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};
