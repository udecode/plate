import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { runEditorTransaction } from '../core/public-state';
import type { EditorStaticApi } from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { deleteText } from '../transforms-text/delete-text';
import { applyDelete } from './delete-backward';

export const applyDeleteFragment: EditorStaticApi['deleteFragment'] = (
  editor,
  { at, direction = 'forward' } = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget({ at });

    if (SelectionApi.isNode(selection)) {
      tx.setSelection(selection);
      applyDelete(editor, {
        direction,
        unit: 'character',
      });
      return;
    }

    if (
      selection &&
      RangeApi.isRange(selection) &&
      RangeApi.isExpanded(selection)
    ) {
      tx.setSelection(SelectionApi.text(selection));
      deleteText(editor, {
        at: selection,
        reverse: direction === 'backward',
      });
    }
  });
};

export const deleteFragment: EditorStaticApi['deleteFragment'] = (
  editor,
  { at, direction = 'forward' } = {}
) => {
  const command = at === undefined ? { direction } : { at, direction };

  dispatchCommand(editor, editorCommands.deleteFragment, command);
};
