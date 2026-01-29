import { TextSelection } from 'prosemirror-state';

/**
 * Checks if value is a TextSelection.
 * @param value Any value.
 */
export const isTextSelection = (value) => {
  value instanceof TextSelection;
};
