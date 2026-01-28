import { getAllFieldAnnotations } from '../fieldAnnotationHelpers/index.js';
import { findParentNodeClosestToPos } from '@core/helpers/index.js';

/**
 * Clean up lists that contain field annotations if there are annotations
 * being deleted.
 * @param {string[]} fieldsToDelete - Array of field IDs to delete.
 * @returns {function} A ProseMirror command function.
 */
export const cleanUpListsWithAnnotations =
  (fieldsToDelete = []) =>
  ({ dispatch, tr, state }) => {
    if (!dispatch) return true;

    if (!Array.isArray(fieldsToDelete)) fieldsToDelete = [fieldsToDelete];
    const { doc } = state;
    const docxAnnotations = getAllFieldAnnotations(state) || [];

    const nodesToDelete = [];

    fieldsToDelete.forEach((fieldId) => {
      const matched = docxAnnotations.find((a) => a.node.attrs.fieldId === fieldId);
      if (!matched) return;

      // find the nearest listItem
      const listItem = findParentNodeClosestToPos(doc.resolve(matched.pos), (node) => node.type.name === 'listItem');
      if (!listItem) return;

      let remainingNodes = 0;
      listItem.node.descendants((node) => {
        if (node.type.name === 'fieldAnnotation') {
          remainingNodes += 1;
        }
      });

      let matchingNodesFound = 0;
      let hasOtherNodes = false;
      listItem.node.children.forEach((child) => {
        const { type } = child;
        if (type.name !== 'paragraph' && type.name !== 'fieldAnnotation') return;

        child.children.forEach((inline) => {
          const isFieldToDelete = fieldsToDelete.includes(inline.attrs.fieldId);
          const isFieldType = inline.type.name === 'fieldAnnotation';
          const isMatchingField = isFieldType && isFieldToDelete;
          if (!isFieldType && !isMatchingField) hasOtherNodes = true;
          if (isMatchingField) matchingNodesFound += 1;
        });
      });

      if (!hasOtherNodes && matchingNodesFound > 0) {
        remainingNodes -= matchingNodesFound;
      }

      if (remainingNodes > 0) {
        return;
      }

      // now “bubble up” as long as each parent has exactly one child
      let { pos, node, depth } = listItem;
      let $pos = doc.resolve(pos);

      while (depth > 0) {
        const parent = $pos.node(depth - 1);
        if (parent.childCount === 1) {
          // climb one level
          depth -= 1;
          pos = $pos.before(depth);
          node = parent;
          $pos = doc.resolve(pos);
        } else {
          break;
        }
      }

      // dedupe
      if (!nodesToDelete.some((n) => n.pos === pos)) {
        nodesToDelete.push({ pos, node });
      }
    });

    if (!nodesToDelete.length) return true;

    // delete from back to front
    nodesToDelete
      .sort((a, b) => b.pos - a.pos)
      .forEach(({ pos, node }) => {
        tr.delete(pos, pos + node.nodeSize);
      });

    // Ensure sync lists updates after this transaction
    tr.setMeta('updateListSync', true);
    return true;
  };
