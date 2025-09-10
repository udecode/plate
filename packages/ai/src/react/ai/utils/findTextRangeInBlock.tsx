import type { NodeEntry } from 'platejs';

import { distance } from 'fastest-levenshtein';
import { type Path, type Range, Node } from 'slate';

function maxAllowedDistance(len: number): number {
  if (len <= 2) return 0;
  if (len <= 5) return 1;
  if (len <= 10) return 2;
  if (len <= 20) return 3;
  // Maximum allowed distance is 5, regardless of text length
  return 5;
}

/** Find text within a block, supporting fuzzy matching. */
export function findTextRangeInBlock({
  block,
  findText,
}: {
  block: NodeEntry;
  findText: string;
}): Range | null {
  const [blockNode, blockPath] = block;

  // Collect all text content and map positions
  const textSegments: { offset: number; path: Path; text: string }[] = [];
  let fullText = '';

  // Iterate through all text nodes in the block
  for (const [textNode, textPath] of Node.texts(blockNode)) {
    const startOffset = fullText.length;
    // textPath is relative to blockNode, not absolute
    const absolutePath = [...blockPath, ...textPath];
    textSegments.push({
      offset: startOffset,
      path: absolutePath,
      text: textNode.text,
    });
    fullText += textNode.text;
  }

  if (!fullText) return null;

  // Try exact match first
  let matchStart = fullText.indexOf(findText);
  let matchEnd = matchStart >= 0 ? matchStart + findText.length : -1;

  // If no exact match, try fuzzy matching
  if (matchStart === -1) {
    const maxDist = maxAllowedDistance(findText.length);
    let bestMatch = { distance: Infinity, end: -1, start: -1 };

    // Sliding window to find best fuzzy match
    for (let i = 0; i <= fullText.length - findText.length; i++) {
      // Try different lengths around the target length
      for (let lenOffset = -maxDist; lenOffset <= maxDist; lenOffset++) {
        const len = findText.length + lenOffset;
        if (len <= 0 || i + len > fullText.length) continue;

        const candidate = fullText.slice(i, i + len);
        const dist = distance(candidate, findText);

        if (dist <= maxDist && dist < bestMatch.distance) {
          bestMatch = { distance: dist, end: i + len, start: i };
        }
      }
    }

    if (bestMatch.start !== -1) {
      matchStart = bestMatch.start;
      matchEnd = bestMatch.end;
    }
  }

  // If still no match, try prefix matching as fallback
  if (matchStart === -1) {
    // Find longest prefix match
    for (let prefixLen = findText.length - 1; prefixLen > 0; prefixLen--) {
      const prefix = findText.slice(0, Math.max(0, prefixLen));
      const idx = fullText.indexOf(prefix);
      if (idx !== -1) {
        matchStart = idx;
        matchEnd = idx + prefixLen;
        break;
      }
    }
  }

  if (matchStart === -1) return null;

  // Convert character offsets to Slate paths and offsets
  const findPoint = (
    charOffset: number,
    isEnd = false
  ): { offset: number; path: Path } => {
    const accumulated = 0;

    // For start positions, if offset lands exactly at the beginning of a segment, use that segment
    if (!isEnd) {
      for (const segment of textSegments) {
        if (charOffset === segment.offset) {
          return {
            offset: 0,
            path: segment.path,
          };
        }
      }
    }

    // Normal search through segments
    for (const segment of textSegments) {
      const segmentEnd = segment.offset + segment.text.length;

      if (charOffset >= segment.offset && charOffset <= segmentEnd) {
        const localOffset = charOffset - segment.offset;
        return {
          offset: localOffset,
          path: segment.path,
        };
      }
    }

    // Fallback to last position
    const lastSegment = textSegments.at(-1);
    if (!lastSegment) {
      return { offset: 0, path: blockPath };
    }
    return {
      offset: lastSegment.text.length,
      path: lastSegment.path,
    };
  };

  const anchor = findPoint(matchStart, false);
  const focus = findPoint(matchEnd, true);

  return {
    anchor,
    focus,
  };
}
