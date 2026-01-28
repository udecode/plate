import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands';

/**
 * Select a node forward.
 *
 * https://prosemirror.net/docs/ref/#commands.selectNodeForward
 */
//prettier-ignore
export const selectNodeForward = () => ({ state, dispatch }) => originalSelectNodeForward(state, dispatch);
