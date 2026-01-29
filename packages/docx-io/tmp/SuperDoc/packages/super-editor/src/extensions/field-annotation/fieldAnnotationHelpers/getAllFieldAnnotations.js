import { helpers } from '@core/index.js';

const { findChildren } = helpers;

/**
 * Get all field annotations in the doc.
 * @param state The editor state.
 * @returns The array of field annotations.
 */
export function getAllFieldAnnotations(state) {
  let fieldAnnotations = findChildren(state.doc, (node) => node.type.name === 'fieldAnnotation');

  return fieldAnnotations;
}
