import { Decorate, isText } from '@udecode/plate-core';
import { Range } from 'slate';
import { FindReplacePlugin } from './types';

export const decorateFindReplace: Decorate<FindReplacePlugin> = (
  editor,
  { key, type }
) => ([node, path]) => {
  const ranges: SearchRange[] = [];

  const { search } = editor.pluginsByKey[key].options as FindReplacePlugin;
  if (!search || !isText(node)) {
    return ranges;
  }

  const { text } = node;
  const parts = text.toLowerCase().split(search.toLowerCase());
  let offset = 0;
  parts.forEach((part, i) => {
    if (i !== 0) {
      ranges.push({
        anchor: { path, offset: offset - search.length },
        focus: { path, offset },
        search,
        [type]: true,
      });
    }
    offset = offset + part.length + search.length;
  });

  return ranges;
};

type SearchRange = Range & {
  search: string;
};
