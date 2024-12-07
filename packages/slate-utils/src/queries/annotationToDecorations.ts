import {
  type TEditor,
  type TText,
  getNodeEntries,
  isText,
} from '@udecode/slate';
import { Point } from 'slate';

import type { Annotation, DecorationWithAnnotations } from './annotation';

export const annotationToDecorations = (
  editor: TEditor,
  options: {
    annotation: Annotation;
    decorations?: Map<string, DecorationWithAnnotations>;
  }
): DecorationWithAnnotations[] => {
  const { annotation, decorations = new Map() } = options;
  const { range } = annotation;
  const results: DecorationWithAnnotations[] = [];

  const textEntries = getNodeEntries<TText>(editor, {
    at: range,
    match: (n) => isText(n),
  });

  for (const [node, path] of textEntries) {
    const textStart = { offset: 0, path };
    const textEnd = { offset: node.text.length, path };

    if (
      Point.isAfter(range.anchor, textEnd) ||
      Point.isBefore(range.focus, textStart)
    ) {
      continue;
    }

    const overlapStart = Point.isAfter(range.anchor, textStart)
      ? range.anchor
      : textStart;
    const overlapEnd = Point.isBefore(range.focus, textEnd)
      ? range.focus
      : textEnd;

    if (Point.isBefore(overlapStart, overlapEnd)) {
      const key = `${path.join(',')}-${overlapStart.offset}-${overlapEnd.offset}`;

      let decoration = decorations.get(key);

      if (!decoration) {
        decoration = {
          anchor: overlapStart,
          annotations: [],
          focus: overlapEnd,
        };
        decorations.set(key, decoration);
        results.push(decoration);
      }

      decoration.annotations.push(annotation);
    }
  }

  return results;
};
