'use client';

import { TrailingBlockPlugin } from 'platejs';
import { SuggestionPlugin } from '@platejs/suggestion/react';

const trailingBlockPlugin = TrailingBlockPlugin.configure({
  options: {
    insert: (editor, { insert }) => {
      editor.getApi(SuggestionPlugin).suggestion.withoutSuggestions(insert);
    },
  },
});

export const TrailingBlockKit = [trailingBlockPlugin];
