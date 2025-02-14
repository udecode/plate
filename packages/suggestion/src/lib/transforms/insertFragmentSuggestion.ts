import {
  type Descendant,
  type SlateEditor,
  TextApi,
} from '@udecode/plate';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
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

    const { id, createdAt: createdAt } = findSuggestionProps(editor, {
      at: editor.selection!,
      type: 'insert',
    });

    console.log(fragment, 'fj');

    fragment.forEach((n) => {
      if (TextApi.isText(n)) {
        if (!n[BaseSuggestionPlugin.key]) {
          // Add suggestion mark
          n[BaseSuggestionPlugin.key] = true;
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
        n[SUGGESTION_KEYS.lineBreak] = {
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
