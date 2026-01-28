import { findWordBounds } from './findWordBounds.js';
import { TextSelection } from 'prosemirror-state';

export const setWordSelection = (view, pos) => {
  const { state, dispatch } = view;
  const word = findWordBounds(state.doc, pos);
  if (!word) return;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, word.from, word.to));
  dispatch(tr);
};
