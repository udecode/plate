import { selectTextblockStart as originalSelectTextblockStart } from 'prosemirror-commands';

/**
 * Moves the cursor to the start of current text block.
 *
 * https://prosemirror.net/docs/ref/#commands.selectTextblockStart
 */
//prettier-ignore
export const selectTextblockStart = () => ({ state, dispatch }) => originalSelectTextblockStart(state, dispatch);
