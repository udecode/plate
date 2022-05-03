import { Decorate, TNodeEntry, Value } from '@udecode/plate-core';
import { Range, Text } from 'slate';
import { FindReplacePlugin } from './types';

export const decorateFindReplace: Decorate<Value, {}, FindReplacePlugin> = (
  editor,
  { key, type }
) => ([node, path]: TNodeEntry) => {
  const ranges: SearchRange[] = [];

  const { search } = editor.pluginsByKey[key].options as FindReplacePlugin;
  if (!search || !Text.isText(node)) {
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
