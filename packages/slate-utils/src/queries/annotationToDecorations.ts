import {
  type TEditor,
  type TText,
  getNodeEntries,
  isText,
} from '@udecode/slate';
import { type Range, type RangeRef, Point } from 'slate';

export type Annotation = {
  range: Range;
  rangeRef: RangeRef;
  text: string;
  data?: Record<string, unknown>;
};

export type DecorationWithAnnotation = Range & {
  annotation: Annotation;
};

export const annotationToDecorations = (
  editor: TEditor,
  options: {
    annotation: Annotation;
  }
): DecorationWithAnnotation[] => {
  const { annotation } = options;
  const { range } = annotation;
  const decorations: DecorationWithAnnotation[] = [];

  // Get annotation boundaries
  const annotationStart = range.anchor;
  const annotationEnd = range.focus;

  const textEntries = getNodeEntries<TText>(editor, {
    at: range,
    match: (n) => isText(n),
  });

  // Create decorations for each text leaf that overlaps with the annotation
  for (const [node, path] of textEntries) {
    const textStart = { offset: 0, path: path };
    const textEnd = { offset: node.text.length, path: path };

    // Skip if text is before annotation start
    if (Point.isAfter(annotationStart, textEnd)) {
      continue;
    }
    // Break if text is after annotation end
    if (Point.isBefore(textEnd, annotationStart)) {
      break;
    }

    // Calculate overlap between annotation and text leaf
    const overlapStart = Point.isAfter(annotationStart, textStart)
      ? annotationStart
      : textStart;
    const overlapEnd = Point.isBefore(annotationEnd, textEnd)
      ? annotationEnd
      : textEnd;

    if (Point.isBefore(overlapStart, overlapEnd)) {
      const decoration = {
        anchor: {
          offset: overlapStart.offset,
          path: path,
        },
        annotation,
        focus: {
          offset: overlapEnd.offset,
          path: path,
        },
      };
      decorations.push(decoration);
    }
  }

  return decorations;
};

export const annotationsToDecorations = (
  editor: TEditor,
  options: {
    annotations: Annotation[];
  }
): DecorationWithAnnotation[] => {
  const { annotations } = options;

  // Get all decorations for each annotation
  return annotations.flatMap((annotation) =>
    annotationToDecorations(editor, { annotation })
  );
};
