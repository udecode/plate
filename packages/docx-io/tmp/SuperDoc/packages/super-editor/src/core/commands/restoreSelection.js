import { TextSelection } from 'prosemirror-state';

export const restoreSelection =
  () =>
  ({ editor, state, tr }) => {
    if (editor.options.lastSelection) {
      const selectionTr = tr.setSelection(
        TextSelection.create(state.doc, editor.options.lastSelection.from, editor.options.lastSelection.to),
      );
      editor.view.dispatch(selectionTr);
    }
  };
