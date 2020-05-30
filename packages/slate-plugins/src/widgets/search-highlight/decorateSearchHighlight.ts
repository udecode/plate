import { NodeEntry, Range, Text } from 'slate';
import { MARK_SEARCH_HIGHLIGHT, SearchHighlightDecorateOptions } from './types';

export const decorateSearchHighlight = ({
  search,
  typeSearchHighlight = MARK_SEARCH_HIGHLIGHT,
}: SearchHighlightDecorateOptions) => ([node, path]: NodeEntry) => {
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
          [typeSearchHighlight]: true,
        });
      }
      offset = offset + part.length + search.length;
    });
  }

  return ranges;
};
