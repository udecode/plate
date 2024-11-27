import type { Decorate } from '@udecode/plate-common';
import type { Range } from 'slate';

import { isElement, isText } from '@udecode/plate-common';

import type { FindReplaceConfig } from './FindReplacePlugin';

export const decorateFindReplace: Decorate<FindReplaceConfig> = ({
  entry: [node, path],
  getOptions,
  type,
}) => {
  const { search } = getOptions();

  if (!(search && isElement(node) && node.children.every(isText))) {
    return [];
  }

  const texts = node.children.map((it) => it.text);
  const str = texts.join('').toLowerCase();
  const searchLower = search.toLowerCase();

  let start = 0;
  const matches: number[] = [];

  while ((start = str.indexOf(searchLower, start)) !== -1) {
    matches.push(start);
    start += searchLower.length;
  }

  if (matches.length === 0) {
    return [];
  }

  const ranges: SearchRange[] = [];
  let cumulativePosition = 0;
  let matchIndex = 0; // Index in the matches array

  for (const [textIndex, text] of texts.entries()) {
    const textStart = cumulativePosition;
    const textEnd = textStart + text.length;

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

        const textNodePath = [...path, textIndex];

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
} & Range;
