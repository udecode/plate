import { joinUp as originalJoinUp } from 'prosemirror-commands';

/**
 * Join the selected block or, if there is a text selection, the
 * closest ancestor block of the selection that can be joined, with
 * the sibling above it.
 *
 * https://prosemirror.net/docs/ref/#commands.joinUp
 */
//prettier-ignore
export const joinUp = () => ({ state, dispatch }) => originalJoinUp(state, dispatch);
