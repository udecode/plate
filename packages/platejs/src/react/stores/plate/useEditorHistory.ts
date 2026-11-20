import { getViewPresentation, type RootKey } from '../../../facade';
import { useOptionalEditorContext } from '../../internal/plite-components';
import {
  type EditorHistoryController,
  useEditorHistory as usePliteEditorHistory,
  type UseEditorHistoryOptions,
} from '../../plite-react';
import { useOptionalEditor } from './useEditor';

/**
 * Create undo/redo commands and keyboard handling.
 *
 * Without `editor` or `root`, while the editor `useEditor()` returns belongs to
 * the `EditorRoot` around the hook, they run through that `EditorRoot`'s shown
 * writable view used last, and are on only while a shown writable `Editable`
 * reaches every root the next undo or redo changes. When no provider gives an
 * editor, they do the same and need an `EditorRoot` around the hook.
 * Otherwise, such as under `EditorController` or under an `EditorProvider`
 * given another editor, they bind to that editor, as with `editor`. With
 * `editor` or `root`, they replay the next batch whatever roots it changes.
 * With `root`, they are off while no view of it is shown. With `editor`, they
 * can stay on while no `Editable` runs that editor, and a click then does
 * nothing. They are off while their view is read-only or composes text.
 */
export function useEditorHistory<const TRoot extends RootKey = RootKey>(
  options: UseEditorHistoryOptions<TRoot> = {}
): EditorHistoryController {
  const editor = useOptionalEditor();
  const around = useOptionalEditorContext();
  const followsRoot =
    editor !== null &&
    around !== null &&
    getViewPresentation(editor) === getViewPresentation(around);

  return usePliteEditorHistory(
    options.editor || options.root || !editor || followsRoot
      ? options
      : { editor, focusPolicy: options.focusPolicy }
  );
}
