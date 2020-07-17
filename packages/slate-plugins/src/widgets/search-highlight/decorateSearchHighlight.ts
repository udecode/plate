import { NodeEntry, Range, Text } from 'slate';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_SEARCH_HIGHLIGHT } from './defaults';
import { SearchHighlightDecorateOptions } from './types';

export const decorateSearchHighlight = (
  options?: SearchHighlightDecorateOptions
) => ([node, path]: NodeEntry) => {
  const { search_highlight, search } = setDefaults(
    options,
    DEFAULTS_SEARCH_HIGHLIGHT
  );

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
          [search_highlight.type]: true,
        });
      }
      offset = offset + part.length + search.length;
    });
  }

  return ranges;
};
