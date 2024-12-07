import type { TEditor } from '@udecode/slate';

import type { Annotation, DecorationWithAnnotations } from './annotation';

import { annotationToDecorations } from './annotationToDecorations';

export const annotationsToDecorations = (
  editor: TEditor,
  options: {
    annotations: Annotation[];
  }
): DecorationWithAnnotations[] => {
  const { annotations } = options;
  const decorations = new Map<string, DecorationWithAnnotations>();

  // Process all annotations and merge overlapping decorations
  annotations.forEach((annotation) => {
    annotationToDecorations(editor, { annotation, decorations });
  });

  return Array.from(decorations.values());
};
