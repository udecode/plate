import type { ElementTypes } from '../../internal/types';
import type { SerializeMdOptions } from '../serializeMd';

import { defaultSerializeRules, MarkdownPlugin } from '../..';

export const getCustomLeaf = (options?: SerializeMdOptions): string[] => {
  if (!options?.editor) {
    return [];
  }

  const customLeaf: string[] = [];

  const nodes =
    options.editor.getOption(MarkdownPlugin, 'nodes') ?? defaultSerializeRules;

  if (nodes) {
    const keys = Object.keys(nodes);

    for (const key of keys) {
      const component = nodes[key as ElementTypes];

      if (component?.isLeaf) {
        customLeaf.push(key);
      }
    }
  }

  return customLeaf;
};
