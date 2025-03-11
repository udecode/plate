import type { SlateEditor } from '@udecode/plate';

import merge from 'lodash/merge.js';

import type {
  SerializeMdNodeOptions,
  SerializeMdOptions,
} from './serializeMdNode';

import { serializeMdNodes } from './serializeMdNodes';

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: SlateEditor,
  options?: {value: Parameters<typeof serializeMdNodes>['0']} & Parameters<typeof serializeMdNodes>['1']
) => {
  const plugins = editor.pluginList.filter(
    (p) => p.node.isElement || p.node.isLeaf
  );

  const pluginNodes = plugins.reduce(
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

  const nodesToSerialize = options?.value ?? editor.children;

  return serializeMdNodes(nodesToSerialize, {
    ...options,
    nodes: merge(pluginNodes, options?.nodes),
  });
};
