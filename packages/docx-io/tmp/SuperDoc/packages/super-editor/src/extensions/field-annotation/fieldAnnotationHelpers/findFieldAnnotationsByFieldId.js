import { helpers } from '@core/index.js';

const { findChildren } = helpers;

/**
 * Find field annotations by field ID or array of field IDs.
 * @param fieldIdOrArray The field ID or array of field IDs.
 * @param state The editor state.
 * @returns The field annotations array.
 */
export function findFieldAnnotationsByFieldId(fieldIdOrArray, state) {
  let fieldAnnotations = findChildren(state.doc, (node) => {
    let isFieldAnnotation = node.type.name === 'fieldAnnotation';
    if (Array.isArray(fieldIdOrArray)) {
      return isFieldAnnotation && fieldIdOrArray.includes(node.attrs.fieldId);
    } else {
      return isFieldAnnotation && node.attrs.fieldId === fieldIdOrArray;
    }
  });

  return fieldAnnotations;
}
