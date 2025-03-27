import type { SerializeMdOptions } from '../serializeMd';

import { MarkdownPlugin } from '../..';
import { defaultNodes } from '../../nodesRule';

export const getCustomLeaf = (options?: SerializeMdOptions): string[] => {
  if (!options?.editor) {
    return [];
  }

  const { editor } = options;

  const customLeaf: string[] = [];

  const nodes = editor.getOption(MarkdownPlugin, 'nodes') ?? defaultNodes;

  if (nodes) {
    const keys = Object.keys(nodes);

    for (const key of keys) {
      const plugin = editor.plugins[key];

      if (plugin?.node?.isLeaf) {
        customLeaf.push(key);
      }
    }
  }

  return customLeaf;
};
