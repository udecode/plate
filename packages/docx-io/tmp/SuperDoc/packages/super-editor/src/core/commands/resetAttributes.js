import { getMarkType } from '../helpers/getMarkType.js';
import { getNodeType } from '../helpers/getNodeType.js';
import { getSchemaTypeNameByName } from '../helpers/getSchemaTypeNameByName.js';
import { deleteProps } from '../utilities/deleteProps.js';

/**
 * Resets some node attributes to the default value.
 * @param {*} typeOrName The type or name of the node.
 * @param {*} attrs  The attributes of the node to reset.
 */
export const resetAttributes =
  (typeOrName, attrs) =>
  ({ tr, state, dispatch }) => {
    let nodeType = null;
    let markType = null;

    const schemaType = getSchemaTypeNameByName(
      typeof typeOrName === 'string' ? typeOrName : typeOrName.name,
      state.schema,
    );

    if (!schemaType) return false;

    if (schemaType === 'node') {
      nodeType = getNodeType(typeOrName, state.schema);
    }
    if (schemaType === 'mark') {
      markType = getMarkType(typeOrName, state.schema);
    }

    if (dispatch) {
      tr.selection.ranges.forEach((range) => {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (nodeType && nodeType === node.type) {
            tr.setNodeMarkup(pos, undefined, deleteProps(node.attrs, attrs));
          }

          if (markType && node.marks.length) {
            node.marks.forEach((mark) => {
              if (markType === mark.type) {
                tr.addMark(pos, pos + node.nodeSize, markType.create(deleteProps(mark.attrs, attrs)));
              }
            });
          }
        });
      });
    }

    return true;
  };
