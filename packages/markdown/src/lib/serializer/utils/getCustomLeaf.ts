import type { ElementTypes } from '../../internal/types';
import type { SerializeMdOptions } from '../serializeMd';

import { defaultSerializeRules, MarkdownPlugin } from '../..';

export const getCustomLeaf = (options?: SerializeMdOptions): string[] => {
  if (!options?.editor) {
    return [];
  }

  const customLeaf: string[] = [];

  const nodeParser =
    options.editor.getOption(MarkdownPlugin, 'nodeParser') ??
    defaultSerializeRules;

  if (nodeParser) {
    const keys = Object.keys(nodeParser);

    for (const key of keys) {
      const component = nodeParser[key as ElementTypes];

      if (component?.isLeaf) {
        customLeaf.push(key);
      }
    }
  }

  return customLeaf;
};
