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

  // Try to find a match
  const matchStart = texts.join('').toLowerCase().indexOf(search.toLowerCase());
  if (matchStart === -1) {
    return [];
  }

  const matchEnd = matchStart + search.length;
  let cumulativePosition = 0;
  const ranges: SearchRange[] = [];

  for (const [i, text] of texts.entries()) {
    const textStart = cumulativePosition;
    const textEnd = cumulativePosition + text.length;

    // Corresponding offsets within the text string
    const overlapStart = Math.max(matchStart, textStart);
    const overlapEnd = Math.min(matchEnd, textEnd);

    if (overlapStart < overlapEnd) {
      // Overlapping region exists
      const anchorOffset = overlapStart - textStart;
      const focusOffset = overlapEnd - textStart;

      // Corresponding offsets within the search string
      const searchOverlapStart = overlapStart - matchStart;
      const searchOverlapEnd = overlapEnd - matchStart;

      const textNodePath = [...path, i];

      ranges.push({
        anchor: {
          path: textNodePath,
          offset: anchorOffset,
        },
        focus: {
          path: textNodePath,
          offset: focusOffset,
        },
        search: search.substring(searchOverlapStart, searchOverlapEnd),
        [type]: true,
      });
    }

    // Update the cumulative position for the next iteration
    cumulativePosition = textEnd;
  }

  return ranges;
};

type SearchRange = {
  search: string;
} & Range;
