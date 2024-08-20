import type { Decorate } from '@udecode/plate-common';
import type { Range } from 'slate';

import { isText } from '@udecode/plate-common';

import type { FindReplaceConfig } from './FindReplacePlugin';

export const decorateFindReplace: Decorate<FindReplaceConfig> = ({
  entry: [node, path],
  options: { search },
  type,
}) => {
  const ranges: SearchRange[] = [];

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
