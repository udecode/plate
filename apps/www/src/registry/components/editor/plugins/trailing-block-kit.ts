import { SuggestionPlugin } from '@platejs/suggestion/react';
import { TrailingBlockPlugin } from 'platejs';

export const TrailingBlockKit = TrailingBlockPlugin.configure({
  options: {
    insert: (editor, { insert }) => {
      editor.getApi(SuggestionPlugin).suggestion.withoutSuggestions(insert);
    },
  },
});
