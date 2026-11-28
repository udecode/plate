import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import {
  getEditorUpdateRoot,
  getSetSite,
  runEditorTransaction,
} from '../core/public-state';
import { refuseCrossing } from '../core/set-root';
import { preservesSelectionForExplicitTarget } from '../core/update-root-selection';
import type {
  AnyEditor,
  EditorFragmentDeletionOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getLocationRoot } from '../internal/root-location';
import { deleteText } from '../transforms-text/delete-text';
import { deleteNodeSelection } from './delete-backward';
import { refusesReadOnlyWrite } from './element-read-only';

export type InternalFragmentDeletionOptions = Omit<
  EditorFragmentDeletionOptions,
  'at'
> & {
  at?: Location | NodeSelection;
};

export const applyDeleteFragment = (
  editor: AnyEditor,
  { at, direction = 'forward' }: InternalFragmentDeletionOptions = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget({ at });

    if (SelectionApi.isNode(selection)) {
      const targetRoot = selection.root ?? getEditorUpdateRoot(editor);
      const preservesSelection = preservesSelectionForExplicitTarget(
        editor,
        at !== undefined,
        { targetRoot }
      );

      if (!preservesSelection) {
        tx.setSelection(selection);
      }
      deleteNodeSelection(
        editor,
        tx,
        selection,
        direction,
        !preservesSelection
      );
      return;
    }

    if (
      selection &&
      RangeApi.isRange(selection) &&
      RangeApi.isExpanded(selection)
    ) {
      const targetRoot =
        getLocationRoot(selection) ?? getEditorUpdateRoot(editor);

      refuseCrossing(getSetSite(editor), selection, targetRoot);
      if (refusesReadOnlyWrite(editor, selection)) {
        return;
      }
      if (
        !preservesSelectionForExplicitTarget(editor, at !== undefined, {
          targetRoot,
        })
      ) {
        tx.setSelection(SelectionApi.text(selection));
      }
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
