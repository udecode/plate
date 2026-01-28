import { selectNodeBackward as originalSelectNodeBackward } from 'prosemirror-commands';

/**
 * Select a node backward.
 *
 * https://prosemirror.net/docs/ref/#commands.selectNodeBackward
 */
export const selectNodeBackward =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeBackward(state, dispatch);
  };
