import { createEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { SuggestionKit } from '@/registry/components/editor/suggestion';

export function createSuggestionDocument() {
  const editor = createEditor({
    plugins: [...BasicBlocksKit, ...SuggestionKit],
    userId: 'alice',
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'We ship on Friday.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'This extra sentence can go.' }],
      },
    ],
  });

  // Fixed IDs render the same on the server and the client.
  editor.update((tx) => {
    tx.authored.propose({ changeId: 'added-words' });
    tx.text.insert('the update ', { at: { path: [0, 0], offset: 8 } });
  });
  editor.update((tx) => {
    tx.authored.propose({ changeId: 'removed-word' });
    tx.text.delete({
      at: {
        anchor: { path: [1, 0], offset: 5 },
        focus: { path: [1, 0], offset: 11 },
      },
    });
  });

  return editor.read.value();
}
