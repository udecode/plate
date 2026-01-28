import { TextSelection } from 'prosemirror-state';

export const insertTabCharacter = ({ tr, state, dispatch }) => {
  const { from } = tr.selection;
  const tabText = state.schema.text('\t');

  tr = tr.replaceSelectionWith(tabText);
  tr = tr.setSelection(TextSelection.create(tr.doc, from + 1));

  if (dispatch) dispatch(tr);
  return true;
};

export const insertTabNode =
  () =>
  ({ tr, state, dispatch }) => {
    const newPos = tr.selection.from;
    const tabNode = state.schema?.nodes?.tab?.create();

    // If tab node isn't defined, fallback to tab character
    if (!tabNode) return insertTabCharacter({ tr, state, dispatch });

    tr.insert(newPos, tabNode);
    if (dispatch) dispatch(tr);
    return true;
  };
