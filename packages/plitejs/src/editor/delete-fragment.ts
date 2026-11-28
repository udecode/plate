import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import {
  getEditorUpdateRoot,
  getSetSite,
  runEditorTransaction,
  withEditorUpdateRoot,
} from '../core/public-state';
import { refuseCrossing } from '../core/set-root';
import type {
  AnyEditor,
  EditorFragmentDeletionOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import { RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getLocationRoot, stripLocationRoots } from '../internal/root-location';
import { deleteText } from '../transforms-text/delete-text';
import { applyDelete } from './delete-backward';
import {
  hasEdgeInReadOnlyInline,
  refusesReadOnlyWrite,
} from './element-read-only';

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
      const targetRoot =
        getLocationRoot(selection) ?? getEditorUpdateRoot(editor);
      const localSelection = getLocationRoot(selection)
        ? stripLocationRoots(selection)
        : selection;

      refuseCrossing(getSetSite(editor), selection, targetRoot);
      if (
        withEditorUpdateRoot(
          editor,
          targetRoot,
          () =>
            hasEdgeInReadOnlyInline(editor, localSelection) ||
            refusesReadOnlyWrite(editor, localSelection)
        )
      ) {
        return;
      }
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
