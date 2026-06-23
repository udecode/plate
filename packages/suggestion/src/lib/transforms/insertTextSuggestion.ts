import type {
  EditorUpdateTransaction,
  SlateEditor,
  TSuggestionText,
} from "platejs";

import { BaseSuggestionPlugin } from "../BaseSuggestionPlugin";
import { findSuggestionProps } from "../queries";
import { getSuggestionKey } from "../utils";
import { getSuggestionApi } from "../utils/getSuggestionApi";
import { deleteFragmentSuggestion } from "./deleteFragmentSuggestion";

export const insertTextSuggestion = (
  editor: SlateEditor,
  text: string,
  activeTx?: EditorUpdateTransaction
) => {
  const applyInsertTextSuggestion = (tx: EditorUpdateTransaction) => {
    let resId: string | undefined;
    const { id, createdAt } = findSuggestionProps(editor, {
      at: editor.selection!,
      type: "insert",
    });

    if (editor.api.isExpanded()) {
      resId = deleteFragmentSuggestion(editor, { tx });
    }

    getSuggestionApi(editor).withoutSuggestions(() => {
      tx.nodes.insert<TSuggestionText>(
        {
          [getSuggestionKey(resId ?? id)]: {
            id: resId ?? id,
            createdAt,
            type: "insert",
            userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
          },
          suggestion: true,
          text,
        },
        {
          at: editor.selection!,
          select: true,
        }
      );
    });

    tx.normalize({ force: true });
  };

  if (activeTx) {
    applyInsertTextSuggestion(activeTx);
  } else {
    editor.update(applyInsertTextSuggestion);
  }
};
