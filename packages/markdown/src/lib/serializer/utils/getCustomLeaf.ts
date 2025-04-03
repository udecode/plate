import type { SerializeMdOptions } from '../serializeMd';

export const getCustomLeaf = (options?: SerializeMdOptions): string[] => {
  if (!options?.editor) {
    return [];
  }

  const { editor } = options;

  const customLeaf: string[] = [];

  const nodes = options.nodes;

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
