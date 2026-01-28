import { newlineInCode as originalNewlineInCode } from 'prosemirror-commands';

/**
 * Add a newline character in code.
 *
 * https://prosemirror.net/docs/ref/#commands.newlineInCode
 */
//prettier-ignore
export const newlineInCode = () => ({ state, dispatch }) => originalNewlineInCode(state, dispatch);
