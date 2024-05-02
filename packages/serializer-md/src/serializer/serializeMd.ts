import type { PlateEditor } from '@udecode/plate-common/server';

import merge from 'lodash/merge.js';

import type {
  SerializeMdNodeOptions,
  SerializeMdOptions,
} from './serializeMdNode';

import { serializeMdNodes } from './serializeMdNodes';

/** Serialize the editor value to Markdown. */
export const serializeMd = (
  editor: PlateEditor,
  options?: Parameters<typeof serializeMdNodes>['1']
) => {
  const plugins = editor.plugins.filter((p) => p.isElement || p.isLeaf);

  const nodes = plugins.reduce(
    (acc, plugin) => {
      (acc as any)[plugin.key] = {
        isLeaf: plugin.isLeaf,
        isVoid: plugin.isVoid,
        type: plugin.type,
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
