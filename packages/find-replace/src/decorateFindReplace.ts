import type { Range } from 'slate';

import {
  type DecorateEntry,
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  isText,
} from '@udecode/plate-common/server';

import type { FindReplacePlugin } from './types';

export const decorateFindReplace =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { key, type }: WithPlatePlugin<FindReplacePlugin, V, E>
  ): DecorateEntry =>
  ([node, path]) => {
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
