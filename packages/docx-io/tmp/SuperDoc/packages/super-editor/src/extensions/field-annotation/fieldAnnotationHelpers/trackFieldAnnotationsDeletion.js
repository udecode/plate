import { findRemovedFieldAnnotations } from './findRemovedFieldAnnotations.js';

export function trackFieldAnnotationsDeletion(editor, tr) {
  let removedAnnotations = [];
  try {
    removedAnnotations = findRemovedFieldAnnotations(tr);
  } catch {}

  if (removedAnnotations.length > 0) {
    setTimeout(() => {
      editor.emit('fieldAnnotationDeleted', {
        editor,
        removedNodes: removedAnnotations,
      });
    }, 0);
  }
}
