import {
  applyDeepToNodes,
  nanoid,
  PlateEditor,
  TDescendant,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
import { findSuggestionId } from '../queries/findSuggestionId';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';

export const insertFragmentSuggestion = <V extends Value>(
  editor: PlateEditor<V>,
  fragment: TDescendant[],
  {
    insertFragment = editor.insertFragment,
  }: {
    insertFragment?: (fragment: TDescendant[]) => void;
  } = {}
) => {
  withoutNormalizing(editor, () => {
    deleteFragmentSuggestion(editor);

    const id = findSuggestionId(editor, editor.selection!) ?? nanoid();

    fragment.forEach((node) => {
      applyDeepToNodes({
        node,
        source: {},
        apply: (n) => {
          if (!n[MARK_SUGGESTION]) {
            // Add suggestion mark
            n[MARK_SUGGESTION] = true;
          }
          if (n.suggestionDeletion) {
            // Remove suggestion deletion mark
            delete n.suggestionDeletion;
          }

          n[KEY_SUGGESTION_ID] = id;
        },
      });
    });

    insertFragment(fragment);
  });
};
