import { findFieldAnnotationsByFieldId } from '../fieldAnnotationHelpers/index.js';

/**
 * Clean up paragraphs that contain field annotations marked for deletion.
 * If a paragraph has only one field annotation and no other content,
 * it will be deleted.
 * @param {string[]} fieldsToDelete - Array of field IDs to delete.
 * @returns {function} A ProseMirror command function.
 */
export const cleanUpParagraphWithAnnotations =
  (fieldsToDelete = []) =>
  ({ dispatch, tr, state }) => {
    if (!dispatch) return true;

    const annotations =
      (typeof findFieldAnnotationsByFieldId === 'function'
        ? findFieldAnnotationsByFieldId(fieldsToDelete, state)
        : []) || [];

    // Parent positions to delete (dedup)
    const toDelete = new Map();

    const sizeOf = (doc) => doc.content.size;
    const inRange = (doc, pos) => Number.isInteger(pos) && pos >= 0 && pos <= sizeOf(doc);

    for (const annotation of annotations) {
      const origPos = annotation && annotation.pos;
      if (!Number.isInteger(origPos)) continue;

      // Map annotation position through current tr
      const mappedPos = tr.mapping.map(origPos, 1);
      if (!inRange(tr.doc, mappedPos)) continue;

      // Resolve against live tr.doc
      let $pos;
      try {
        $pos = tr.doc.resolve(mappedPos);
      } catch {
        continue;
      }

      const parent = $pos.parent;
      if (!parent) continue;

      // Only delete parent if it's effectively a single-child container
      if (parent.childCount >= 2) continue;

      // Sanity: ensure we're still looking at the same kind of node
      const currentNode = tr.doc.nodeAt(mappedPos);
      const annotatedNode = annotation && annotation.node;
      if (!currentNode) continue;
      if (annotatedNode && !annotatedNode.sameMarkup?.(currentNode) && annotatedNode.type !== currentNode.type) {
        continue;
      }

      // Delete the *parent* from its own start
      const parentPos = $pos.before(); // start position of the parent node
      if (!inRange(tr.doc, parentPos)) continue;

      toDelete.set(parentPos, true);
    }

    if (toDelete.size === 0) return true;

    // Delete from highest -> lowest; remap each target just before deleting
    const sorted = [...toDelete.keys()].sort((a, b) => b - a);
    let changed = false;

    for (const originalParentPos of sorted) {
      const mappedParentPos = tr.mapping.map(originalParentPos, -1);
      if (!inRange(tr.doc, mappedParentPos)) continue;

      const targetNode = tr.doc.nodeAt(mappedParentPos);
      if (!targetNode) continue;

      const from = mappedParentPos;
      const to = mappedParentPos + targetNode.nodeSize;

      if (!inRange(tr.doc, from) || !inRange(tr.doc, to) || to <= from) continue;

      try {
        tr.delete(from, to);
        changed = true;
      } catch {
        continue;
      }
    }

    if (changed) dispatch(tr);
    return true;
  };
