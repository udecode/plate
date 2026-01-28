import { selectAll as originalSelectAll } from 'prosemirror-commands';

/**
 * Select the whole document.
 *
 * https://prosemirror.net/docs/ref/#commands.selectAll
 */
//prettier-ignore
export const selectAll = () => ({ state, dispatch }) => originalSelectAll(state, dispatch);
