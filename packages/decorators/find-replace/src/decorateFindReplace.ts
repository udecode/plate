import { Decorate } from '@udecode/plate-core';
import { NodeEntry, Range, Text } from 'slate';
import { FindReplacePlugin } from './types';

export const decorateFindReplace: Decorate<{}, FindReplacePlugin> = (
  editor,
  { type, options: { search } }
) => ([node, path]: NodeEntry) => {
  const ranges: Range[] = [];

  if (search && Text.isText(node)) {
    const { text } = node;
    const parts = text.split(search);
    let offset = 0;
    parts.forEach((part, i) => {
      if (i !== 0) {
        ranges.push({
          anchor: { path, offset: offset - search.length },
          focus: { path, offset },
          [type]: true,
        });
      }
      offset = offset + part.length + search.length;
    });
  }

  return ranges;
};
