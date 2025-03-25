import type { SerializeMdOptions } from '../serializeMd';

import { type CommentItem, MarkdownPlugin } from '../..';

export const getCustomLeaf = (options?: SerializeMdOptions): string[] => {
  if (!options?.editor) {
    return [];
  }

  const customLeaf: string[] = [];

  const components = options.editor.getOption(MarkdownPlugin, 'components');

  if (components) {
    const keys = Object.keys(components);

    for (const key of keys) {
      const component = components[key] as CommentItem | undefined;

      if (component?.isLeaf) {
        customLeaf.push(key);
      }
    }
  }

  return customLeaf;
};
