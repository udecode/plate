import {
  type EditorUpdateTransaction,
  type Range,
  type BasePlateEditor,
  RangeApi,
} from 'platejs';

import { findSuggestionProps } from '../queries';
import { setSuggestionNodes } from './setSuggestionNodes';

export const deleteFragmentSuggestion = (
  editor: BasePlateEditor,
  {
    at,
    reverse,
    tx: activeTx,
  }: { at?: Range; reverse?: boolean; tx?: EditorUpdateTransaction } = {}
) => {
  let resId: string | undefined;

  const applyDeleteFragmentSuggestion = (tx: EditorUpdateTransaction) => {
    const selection = at ?? editor.selection!;
    const { createdAt, id } = findSuggestionProps(editor, {
      at: selection,
      type: 'remove',
    });

    resId = id;

    setSuggestionNodes(editor, {
      at: selection,
      createdAt,
      includeInlineElements: true,
      suggestionDeletion: true,
      suggestionId: id,
      tx,
    });

    if (at) {
      const [start, end] = RangeApi.edges(selection);

      tx.selection.set(reverse ? start : end);
    } else {
      tx.selection.collapse({ edge: reverse ? 'start' : 'end' });
    }
  };

  if (activeTx) {
    applyDeleteFragmentSuggestion(activeTx);
  } else {
    editor.update(applyDeleteFragmentSuggestion);
  }

  return resId;
};
