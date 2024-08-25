import type { SlateEditor } from '@udecode/plate-common';

import merge from 'lodash/merge.js';

import type {
  SerializeMdNodeOptions,
  SerializeMdOptions,
} from './serializeMdNode';

import { serializeMdNodes } from './serializeMdNodes';

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,
  options?: Parameters<typeof serializeMdNodes>['1']
) => {
  const plugins = editor.pluginList.filter(
    (p) => p.node.isElement || p.node.isLeaf
  );

  const nodes = plugins.reduce(
    (acc, plugin) => {
      (acc as any)[plugin.key] = {
        isLeaf: plugin.node.isLeaf,
        isVoid: plugin.node.isVoid,
        type: plugin.node.type,
      } as SerializeMdNodeOptions;

      return acc;
    },
    {} as SerializeMdOptions['nodes']
  );

  return serializeMdNodes(editor.children, {
    ...options,
    nodes: merge(nodes, options?.nodes),
  });
};
