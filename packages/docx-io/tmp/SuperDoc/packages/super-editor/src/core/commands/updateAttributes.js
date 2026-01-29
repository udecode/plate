import { getMarkType } from '../helpers/getMarkType.js';
import { getNodeType } from '../helpers/getNodeType.js';
import { getSchemaTypeNameByName } from '../helpers/getSchemaTypeNameByName.js';

/**
 * Update attributes of a node or mark.
 * @param typeOrName The type or name of the node/mark.
 * @param attrs The attrs of the node/mark.
 */
//prettier-ignore
export const updateAttributes = (typeOrName, attrs = {}) => ({ tr, state, dispatch }) => {
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
      const from = range.$from.pos;
      const to = range.$to.pos;

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (nodeType && nodeType === node.type) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
        }

        if (markType && node.marks.length) {
          node.marks.forEach((mark) => {
            if (markType === mark.type) {
              const trimmedFrom = Math.max(pos, from);
              const trimmedTo = Math.min(pos + node.nodeSize, to);

              tr.addMark(trimmedFrom, trimmedTo, markType.create({ ...mark.attrs, ...attrs }));
            }
          });
        }
      });
    });
  }

  return true;
};
