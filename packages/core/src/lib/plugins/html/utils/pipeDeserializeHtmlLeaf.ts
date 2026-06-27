import type { AnyObject } from '@udecode/utils';

import type { BaseEditor } from '../../../editor';

import { pluginDeserializeHtml } from './pluginDeserializeHtml';

export const pipeDeserializeHtmlLeaf = (
  editor: BaseEditor,
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
