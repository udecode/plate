import { createParagraphNear as originalCreateParagraphNear } from 'prosemirror-commands';

/**
 * Create a paragraph nearby.
 */
//prettier-ignore
export const createParagraphNear = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch);
};
