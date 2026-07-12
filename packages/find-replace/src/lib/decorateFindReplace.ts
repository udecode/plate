import type { Decorate } from '@platejs/core';
import {
  ElementApi,
  NodeApi,
  type NodeEntry,
  type Range,
  type Text,
  TextApi,
} from '@platejs/plite';

import type { FindReplaceConfig } from './FindReplacePlugin';

export const decorateFindReplace: Decorate<FindReplaceConfig> = ({
  editor,
  entry: [node, path],
  getOptions,
  type,
}) => {
  const { search } = getOptions();

  if (
    !(search && ElementApi.isElement(node) && editor.read.nodes.isBlock(node))
  ) {
    return [];
  }

  const textEntries: NodeEntry<Text>[] = [];

  for (const [index, child] of node.children.entries()) {
    if (TextApi.isText(child)) {
      textEntries.push([child, [index]]);
    } else if (
      ElementApi.isElement(child) &&
      editor.read.schema.isInline(child)
    ) {
      for (const [text, relativePath] of NodeApi.texts(child)) {
        textEntries.push([text, [index, ...relativePath]]);
      }
    }
  }
  const str = textEntries
    .map(([text]) => text.text)
    .join('')
    .toLowerCase();
  const searchLower = search.toLowerCase();

  let start = 0;
  const matches: number[] = [];

  while (true) {
    start = str.indexOf(searchLower, start);

    if (start === -1) break;

    matches.push(start);
    start += searchLower.length;
  }

  if (matches.length === 0) {
    return [];
  }

  const ranges: SearchRange[] = [];
  let cumulativePosition = 0;
  let matchIndex = 0; // index in the matches array

  for (const [text, relativePath] of textEntries) {
    const textStart = cumulativePosition;
    const textEnd = textStart + text.text.length;

    // Process matches that overlap with the current text node
    while (matchIndex < matches.length && matches[matchIndex] < textEnd) {
      const matchStart = matches[matchIndex];
      const matchEnd = matchStart + search.length;

      // If the match ends before the start of the current text, move to the next match
      if (matchEnd <= textStart) {
        matchIndex++;

        continue;
      }

      // Calculate overlap between the text and the current match
      const overlapStart = Math.max(matchStart, textStart);
      const overlapEnd = Math.min(matchEnd, textEnd);

      if (overlapStart < overlapEnd) {
        const anchorOffset = overlapStart - textStart;
        const focusOffset = overlapEnd - textStart;

        // Corresponding offsets within the search string
        const searchOverlapStart = overlapStart - matchStart;
        const searchOverlapEnd = overlapEnd - matchStart;

        const textNodePath = [...path, ...relativePath];

        ranges.push({
          anchor: {
            offset: anchorOffset,
            path: textNodePath,
          },
          focus: {
            offset: focusOffset,
            path: textNodePath,
          },
          search: search.slice(searchOverlapStart, searchOverlapEnd),
          [type]: true,
        });
      }
      // If the match ends within the current text, move to the next match
      if (matchEnd <= textEnd) {
        matchIndex++;
      } else {
        // The match continues in the next text node
        break;
      }
    }

    cumulativePosition = textEnd;
  }

  return ranges;
};

type SearchRange = {
  search: string;
} & Range &
  Record<string, unknown>;
