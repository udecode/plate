import { NodeEntry, Range, Text } from 'slate';
import { DecorateSearchHighlightOptions } from './types';

export const decorateSearchHighlight = ({
  search,
}: DecorateSearchHighlightOptions) => ([node, path]: NodeEntry) => {
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
          highlight: true,
        });
      }
      offset = offset + part.length + search.length;
    });
  }

  return ranges;
};
