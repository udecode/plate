import React from 'react';
import { NodeEntry, Range, Text } from 'slate';
import { Plugin, RenderLeafProps } from 'slate-react';
import { HighlightLeaf } from './HighlightLeaf';

export const decorateHighlight = (
  [node, path]: NodeEntry,
  { search }: any = {}
) => {
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

export const renderLeafHighlight = ({ children, leaf }: RenderLeafProps) => (
  <HighlightLeaf {...leaf}>{children}</HighlightLeaf>
);

export const HighlightPlugin = (): Plugin => ({
  decorate: decorateHighlight,
  renderLeaf: renderLeafHighlight,
});
