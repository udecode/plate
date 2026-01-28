import { selectTextblockEnd as originalSelectTextblockEnd } from 'prosemirror-commands';

/**
 * Moves the cursor to the end of current text block.
 *
 * https://prosemirror.net/docs/ref/#commands.selectTextblockEnd
 */
//prettier-ignore
export const selectTextblockEnd = () => ({ state, dispatch }) => originalSelectTextblockEnd(state, dispatch);
