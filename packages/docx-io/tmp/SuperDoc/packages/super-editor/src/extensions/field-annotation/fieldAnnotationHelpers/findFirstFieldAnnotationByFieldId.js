/**
 * Find first field annotation by field ID.
 * @param fieldId The field ID.
 * @param state The editor state.
 * @returns The field annotation or null.
 */
export function findFirstFieldAnnotationByFieldId(fieldId, state) {
  let fieldAnnotation = findNode(state.doc, (node) => {
    return node.type.name === 'fieldAnnotation' && node.attrs.fieldId === fieldId;
  });

  return fieldAnnotation;
}

function findNode(node, predicate) {
  let found = null;
  node.descendants((node, pos) => {
    if (predicate(node)) found = { node, pos };
    if (found) return false;
  });
  return found;
}
