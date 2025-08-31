import { Range, Text, Node, Path } from 'slate';
import { NodeApi, type SlateEditor, NodeEntry } from 'platejs';
import { distance } from 'fastest-levenshtein';

function maxAllowedDistance(len: number): number {
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
  const textSegments: Array<{ text: string; path: Path; offset: number }> = [];
  let fullText = '';

  // Iterate through all text nodes in the block
  for (const [textNode, textPath] of Node.texts(blockNode)) {
    const startOffset = fullText.length;
    // textPath is relative to blockNode, not absolute
    const absolutePath = [...blockPath, ...textPath];
    textSegments.push({
      text: textNode.text,
      path: absolutePath,
      offset: startOffset,
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
    let bestMatch = { start: -1, end: -1, distance: Infinity };

    // Sliding window to find best fuzzy match
    for (let i = 0; i <= fullText.length - findText.length; i++) {
      // Try different lengths around the target length
      for (let lenOffset = -maxDist; lenOffset <= maxDist; lenOffset++) {
        const len = findText.length + lenOffset;
        if (len <= 0 || i + len > fullText.length) continue;

        const candidate = fullText.substring(i, i + len);
        const dist = distance(candidate, findText);

        if (dist <= maxDist && dist < bestMatch.distance) {
          bestMatch = { start: i, end: i + len, distance: dist };
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
      const prefix = findText.substring(0, prefixLen);
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
    isEnd: boolean = false
  ): { path: Path; offset: number } => {
    let accumulated = 0;

    // For start positions, if offset lands exactly at the beginning of a segment, use that segment
    if (!isEnd) {
      for (let i = 0; i < textSegments.length; i++) {
        if (charOffset === textSegments[i].offset) {
          return {
            path: textSegments[i].path,
            offset: 0,
          };
        }
      }
    }

    // Normal search through segments
    for (let i = 0; i < textSegments.length; i++) {
      const segment = textSegments[i];
      const segmentEnd = segment.offset + segment.text.length;

      if (charOffset >= segment.offset && charOffset <= segmentEnd) {
        const localOffset = charOffset - segment.offset;
        return {
          path: segment.path,
          offset: localOffset,
        };
      }
    }

    // Fallback to last position
    const lastSegment = textSegments[textSegments.length - 1];
    return {
      path: lastSegment.path,
      offset: lastSegment.text.length,
    };
  };

  const anchor = findPoint(matchStart, false);
  const focus = findPoint(matchEnd, true);

  // console.log('🚀 ~ findTextRangeInBlock ~ fullText:', fullText);

  return {
    anchor,
    focus,
  };
}
