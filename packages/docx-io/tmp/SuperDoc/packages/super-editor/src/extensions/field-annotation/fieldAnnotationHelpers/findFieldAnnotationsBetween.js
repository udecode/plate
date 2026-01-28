/**
 * Find all field annotations between positions.
 * @param from From position.
 * @param to To position.
 * @param doc Document.
 * @returns The array of field annotations (node and pos).
 */
export function findFieldAnnotationsBetween(from, to, doc) {
  let fieldAnnotations = [];

  doc.nodesBetween(from, to, (node, pos) => {
    if (!node || node?.nodeSize === undefined) {
      return;
    }

    if (node.type.name === 'fieldAnnotation') {
      fieldAnnotations.push({
        node,
        pos,
      });
    }
  });

  return fieldAnnotations;
}
