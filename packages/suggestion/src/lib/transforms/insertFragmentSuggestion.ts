import type { BaseEditor } from '@platejs/core';
import {
  type Descendant,
  type EditorUpdateTransaction,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';
import { getSuggestionKey, getSuggestionKeys } from '../utils/index';
import { deleteFragmentSuggestionWithTx } from './deleteFragmentSuggestion';

export const insertFragmentSuggestion = (
  editor: BaseEditor,
  fragment: Descendant[]
) => {
  editor.update((tx) => {
    insertFragmentSuggestionWithTx(editor, tx, fragment, () => {
      tx.fragment.insert(fragment);
    });
  });
};

export const insertFragmentSuggestionWithTx = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  fragment: Descendant[],
  insertFragment: () => void
) => {
  deleteFragmentSuggestionWithTx(editor, tx);

  const selection = editor.read.selection();

  if (!selection) return;

  const { id, createdAt } = findSuggestionProps(editor, {
    at: selection,
    type: 'insert',
  });

  fragment.forEach((node) => {
    if (TextApi.isText(node)) {
      if (!node[KEYS.suggestion]) {
        node[KEYS.suggestion] = true;
      }

      getSuggestionKeys(node).forEach((key) => {
        delete node[key];
      });

      node[getSuggestionKey(id)] = {
        id,
        createdAt,
        type: 'insert',
        userId: editor.plugin(BaseSuggestionPlugin).getOptions().currentUserId!,
      };

      return;
    }

    node[KEYS.suggestion] = {
      id,
      createdAt,
      type: 'insert',
      userId: editor.plugin(BaseSuggestionPlugin).getOptions().currentUserId!,
    };
  });

  editor.plugin(BaseSuggestionPlugin).api.withoutSuggestions(() => {
    insertFragment();
  });

  tx.normalize({ force: true });
};
