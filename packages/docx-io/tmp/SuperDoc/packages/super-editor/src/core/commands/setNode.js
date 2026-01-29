import { setBlockType } from 'prosemirror-commands';
import { getNodeType } from '../helpers/getNodeType.js';

/**
 * Replace a given range with a node.
 * @param typeOrName The type or name of the node.
 * @param attrs The attributes of the node.
 */
export const setNode =
  (typeOrName, attrs = {}) =>
  ({ state, dispatch, chain }) => {
    const type = getNodeType(typeOrName, state.schema);
    if (!type.isTextblock) return false;

    return (
      chain()
        // try to convert node to default node if needed
        .command(({ commands }) => {
          const canSetBlock = setBlockType(type, attrs)(state);
          if (canSetBlock) return true;
          return commands.clearNodes();
        })
        .command(({ state: updatedState }) => {
          return setBlockType(type, attrs)(updatedState, dispatch);
        })
        .run()
    );
  };
