import { findParentNode } from '../helpers/findParentNode.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';

/**
 * Create a new list either from blank or content
 * If multiple paragraphs are selected, it will create a new list item for each paragraph.
 * @param listTypeOrName The type/name of the list.
 * @param itemTypeOrName The type/name of the list item.
 * @param keepMarks Keep marks when toggling.
 * @param attributes Attrs for the new list.
 */
export const toggleList =
  (listType) =>
  ({ editor, state, tr }) => {
    const { selection } = state;
    const { from, to } = selection;

    // Check if we're already in a list of this type
    const isList = findParentNode((node) => node.type === listType)(tr.selection);

    if (!isList) {
      // If selection spans multiple nodes, handle each paragraph separately
      if (!selection.empty && from !== to) {
        const paragraphsToConvert = [];

        // Collect all paragraph nodes that are fully or partially selected
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'paragraph') {
            // Check if this paragraph intersects with the selection
            const nodeFrom = pos;
            const nodeTo = pos + node.nodeSize;

            if (nodeFrom < to && nodeTo > from) {
              paragraphsToConvert.push({
                node,
                pos,
                from: Math.max(nodeFrom, from),
                to: Math.min(nodeTo, to),
              });
            }
          }
          return false;
        });

        if (paragraphsToConvert.length > 1) {
          // Create a single new list definition that all lists will share
          const numId = ListHelpers.getNewListId(editor);
          if (typeof listType === 'string') listType = editor.schema.nodes[listType];

          ListHelpers.generateNewListDefinition({ numId, listType, editor });

          // Process paragraphs from end to beginning to avoid position shifts
          paragraphsToConvert.reverse().forEach(({ node, pos }) => {
            const level = 0;
            const listLevel = [1];

            // Create a new list with the shared numId
            const listNode = ListHelpers.createSchemaOrderedListNode({
              level,
              numId,
              listType,
              editor,
              listLevel,
              contentNode: node.toJSON(),
            });

            // Replace the paragraph with the new list
            const replaceFrom = pos;
            const replaceTo = pos + node.nodeSize;
            ListHelpers.insertNewList(tr, replaceFrom, replaceTo, listNode);
          });

          return true;
        }
      }

      // Single paragraph or no multi-paragraph selection - use existing logic
      return ListHelpers.createNewList({ listType, tr, editor });
    }

    return false;
  };
