import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { deleteSuggestionWithTx } from './deleteSuggestion';

export const deleteFragmentSuggestion = (
  editor: BaseEditor,
  {
    moveSelection,
    reverse,
  }: { moveSelection?: boolean; reverse?: boolean } = {}
) => {
  let resId: string | undefined;

  editor.update((tx) => {
    resId = deleteFragmentSuggestionWithTx(editor, tx, {
      moveSelection,
      reverse,
    });
  });

  return resId;
};

export const deleteFragmentSuggestionWithTx = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    moveSelection = false,
    reverse,
  }: { moveSelection?: boolean; reverse?: boolean } = {}
) => {
  const selection = editor.read.selection();

  if (!selection) return;

  const edges = editor.read.ranges.edges(selection);

  if (!edges) return;

  const [start, end] = edges;

  if (reverse) {
    tx.selection.collapse({ edge: 'end' });
    return deleteSuggestionWithTx(
      editor,
      tx,
      { anchor: end, focus: start },
      { reverse: true, unit: 'block' }
    );
  }

  tx.selection.collapse({ edge: 'start' });

  return deleteSuggestionWithTx(
    editor,
    tx,
    { anchor: start, focus: end },
    {
      moveSelection,
      unit: 'block',
    }
  );
};
