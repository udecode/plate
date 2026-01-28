import { exitCode as originalExitCode } from 'prosemirror-commands';

/**
 * Exit from a code block.
 */
//prettier-ignore
export const exitCode = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch);
};
