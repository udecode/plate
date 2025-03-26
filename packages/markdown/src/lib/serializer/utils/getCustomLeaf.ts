import type { SerializeMdOptions } from '../serializeMd';

import { defaultSerializeRules, MarkdownPlugin } from '../..';

export const getCustomLeaf = (options?: SerializeMdOptions): string[] => {
  if (!options?.editor) {
    return [];
  }

  const { editor } = options;

  const customLeaf: string[] = [];

  const nodes =
    editor.getOption(MarkdownPlugin, 'nodes') ?? defaultSerializeRules;

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
