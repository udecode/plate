'use client';

import { BaseLinkPlugin } from 'platejs';
import { createEditor, EditorContent, EditorRoot } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import { useState } from 'react';

const createPersistedSuggestionEditor = () => {
  const seed = createEditor({
    initialValue: [
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'React' }],
            type: 'link',
            url: 'https://react.dev',
          },
          { text: '. capabilities' },
        ],
        type: 'paragraph',
      },
      { children: [{ text: 'review' }], type: 'paragraph' },
    ],
    plugins: [BaseLinkPlugin, SuggestionPlugin],
    userId: 'alice',
  });

  seed.update((tx) => {
    tx.authored.propose();
    tx.text.insert(' pending', { at: { offset: 6, path: [1, 0] } });
  });

  return createEditor({
    initialValue: seed.read.value(),
    plugins: [BaseLinkPlugin, SuggestionPlugin],
    userId: 'alice',
  });
};

export default function SuggestionFirstPaintPage() {
  const [editor] = useState(createPersistedSuggestionEditor);

  return (
    <main>
      <EditorRoot
        authored={{ intent: 'propose', projection: 'markup' }}
        editor={editor}
      >
        <EditorContent aria-label="Persisted suggestions" />
      </EditorRoot>
    </main>
  );
}
