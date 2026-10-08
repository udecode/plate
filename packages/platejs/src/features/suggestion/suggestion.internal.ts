import type { AuthoredChangePublication } from '../../authored';
import { AuthoredPlugin } from '../../authored';
import type { DecorationRefresh, Editor } from '../../core';

export const observeSuggestionChanges = (
  editor: Editor,
  refresh: (input: DecorationRefresh) => void,
  onPublication?: (publication: AuthoredChangePublication) => void
) =>
  editor.plugin(AuthoredPlugin).api.subscribeChanges((publication) => {
    if (publication.nodeKeys.length > 0) {
      refresh({ nodeKeys: publication.nodeKeys });
    }
    onPublication?.(publication);
  });
