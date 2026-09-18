import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createEditor } from 'platejs';
import { authored } from 'platejs/authored';
import type { CommentsJSON } from 'platejs/comments';

import {
  richTextEditorComments,
  richTextEditorValue,
} from '../src/registry/blocks/editor-ai/components/editor/rich-text-editor-value';
import { BaseEditorKit } from '../src/registry/components/editor/plugins-static';

// Keep existing-text edits independent of the later suggested link insertion.
let authorId = 'bob';
const editor = createEditor({
  plugins: [...BaseEditorKit, authored({ authorId: () => authorId })],
  initialValue: { children: richTextEditorValue.children },
});

editor.update((tx) => {
  const offset = 'Review and refine content seamlessly. Use  or to '.length;

  tx.authored.propose();
  tx.text.delete({
    at: {
      anchor: { offset, path: [3, 0] },
      focus: { offset: offset + 'mark text for removal'.length, path: [3, 0] },
    },
  });
});
authorId = 'charlie';
let overlapChangeId = '';
editor.update((tx) => {
  overlapChangeId = tx.authored.propose();
  tx.text.insert('overlapping ', {
    at: {
      offset: ' on many text segments. You can even have '.length,
      path: [3, 2],
    },
  });
});
authorId = 'alice';
editor.update((tx) => {
  tx.authored.propose();
  tx.nodes.insert(
    {
      type: 'link',
      url: '/docs/suggestion',
      children: [{ text: 'suggestions' }],
    },
    {
      at: {
        offset: 'Review and refine content seamlessly. Use '.length,
        path: [3, 0],
      },
    }
  );
  tx.text.insert(' like this added text', { at: { offset: 0, path: [3, 2] } });
});

const threads = richTextEditorComments.threads.map((thread) =>
  thread.id === 'discussion2'
    ? { ...thread, target: { id: overlapChangeId, type: 'change' as const } }
    : {
        ...thread,
        target: { type: 'range' as const },
      }
);

const anchor = editor.anchor(
  {
    anchor: { path: [3, 1, 0], offset: 0 },
    focus: { path: [3, 2], offset: 22 },
  },
  { association: 'inward', deletion: 'nearest' }
);
const comments: CommentsJSON = {
  kind: 'plate-comments',
  version: 1,
  threads,
  ranges: [{ threadId: 'discussion1', range: editor.anchor.save(anchor) }],
};
anchor.release();

const output = fileURLToPath(
  new URL(
    '../src/registry/blocks/editor-ai/components/editor/rich-text-editor-value.ts',
    import.meta.url
  )
);
writeFileSync(
  output,
  `import type { EditorDocumentValue } from 'platejs';\nimport type { CommentsJSON } from 'platejs/comments';\n\n// Saved native document. Regenerate with apps/www/scripts/generate-rich-text-editor-value.ts.\nexport const richTextEditorValue: EditorDocumentValue = ${JSON.stringify(editor.read.value(), null, 2)};\n\nexport const richTextEditorComments: CommentsJSON = ${JSON.stringify(comments, null, 2)};\n`
);
for (const args of [
  ['exec', 'oxlint', '--fix', output],
  ['exec', 'oxfmt', output],
]) {
  execFileSync('pnpm', args, {
    cwd: new URL('../../../', import.meta.url),
    stdio: 'inherit',
  });
}
