import type { Range } from 'slate';

import { type Decorate, getPluginOptions } from '@udecode/plate-common';
import { isText } from '@udecode/plate-common/server';

import type { FindReplacePluginOptions } from './types';

export const decorateFindReplace: Decorate<FindReplacePluginOptions> = ({
  editor,
  entry: [node, path],
  plugin: { key, type },
}) => {
  const ranges: SearchRange[] = [];

  const { search } = getPluginOptions<FindReplacePluginOptions>(editor, key);

  if (!search || !isText(node)) {
    return ranges;
  }

  const { text } = node;
  const parts = text.toLowerCase().split(search.toLowerCase());
  let offset = 0;
  parts.forEach((part, i) => {
    if (i !== 0) {
      ranges.push({
        anchor: { offset: offset - search.length, path },
        focus: { offset, path },
        search,
        [type]: true,
      });
    }

    offset = offset + part.length + search.length;
  });

  return ranges;
};

type SearchRange = {
  search: string;
} & Range;
