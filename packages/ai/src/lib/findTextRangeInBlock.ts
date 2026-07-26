import { distance } from 'fastest-levenshtein';
import { type NodeEntry, type Path, type Range, NodeApi } from '@platejs/plite';

/** Find text within a block, supporting fuzzy matching. */
export function findTextRangeInBlock({
  block,
  findText,
}: {
  block: NodeEntry;
  findText: string;
}): Range | null {
  const [blockNode, blockPath] = block;

  const textSegments: { offset: number; path: Path; text: string }[] = [];
  let fullText = '';

  for (const [textNode, textPath] of NodeApi.texts(blockNode)) {
    const startOffset = fullText.length;
    const absolutePath = [...blockPath, ...textPath];
    textSegments.push({
      offset: startOffset,
      path: absolutePath,
      text: textNode.text,
    });
    fullText += textNode.text;
  }

  if (!fullText) return null;

  let matchStart = fullText.indexOf(findText);
  let matchEnd = matchStart >= 0 ? matchStart + findText.length : -1;

  if (matchStart === -1) {
    const maxDist =
      findText.length <= 2
        ? 0
        : findText.length <= 5
          ? 1
          : findText.length <= 10
            ? 2
            : findText.length <= 20
              ? 3
              : 5;
    let bestMatch = { distance: Number.POSITIVE_INFINITY, end: -1, start: -1 };

    for (let i = 0; i <= fullText.length - findText.length; i++) {
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

  if (matchStart === -1) {
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

  const findPoint = (
    charOffset: number,
    isEnd = false
  ): { offset: number; path: Path } => {
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
