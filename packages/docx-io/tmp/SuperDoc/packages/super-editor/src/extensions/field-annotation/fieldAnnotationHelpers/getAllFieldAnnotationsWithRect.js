import { posToDOMRect } from '@core/helpers/index.js';
import { getAllFieldAnnotations } from './getAllFieldAnnotations.js';

/**
 * Get all field annotations with rects in the doc.
 * @param view The editor view.
 * @param state The editor state.
 * @returns The array of field annotations with rects.
 */
export function getAllFieldAnnotationsWithRect(view, state) {
  let fieldAnnotations = getAllFieldAnnotations(state).map(({ node, pos }) => {
    let rect = posToDOMRect(view, pos, pos + node.nodeSize);
    return {
      node,
      pos,
      rect,
    };
  });

  return fieldAnnotations;
}
