import { type Descendant, type SlateEditor, KEYS, TextApi } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';
import { getSuggestionKey, getSuggestionKeys } from '../utils/index';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';

export const insertFragmentSuggestion = (
  editor: SlateEditor,
  fragment: Descendant[],
  {
    insertFragment = editor.tf.insertFragment,
  }: {
    insertFragment?: (fragment: Descendant[]) => void;
  } = {}
) => {
  editor.tf.withoutNormalizing(() => {
    deleteFragmentSuggestion(editor);

    const { id, createdAt } = findSuggestionProps(editor, {
      at: editor.selection!,
      type: 'insert',
    });

    fragment.forEach((n) => {
      if (TextApi.isText(n)) {
        if (!n[KEYS.suggestion]) {
          // Add suggestion mark
          n[KEYS.suggestion] = true;
        }

        // remove the other suggestion data
        const otherUserKeys = getSuggestionKeys(n);
        otherUserKeys.forEach((key) => {
          delete n[key];
        });

        n[getSuggestionKey(id)] = {
          id,
          createdAt,
          type: 'insert',
          userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
        };
      } else {
        n[KEYS.suggestion] = {
          id,
          createdAt,
          type: 'insert',
          userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
        };
      }
    });

    editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
      insertFragment(fragment);
    });
  });
};
