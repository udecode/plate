import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createEditor } from 'platejs';
import { AuthoredPlugin, projectAuthoredDocument } from 'platejs/authored';
import type { CommentsJSON } from 'platejs/comments';

import {
  richTextEditorComments,
  richTextEditorValue,
} from '../src/registry/blocks/editor-ai/components/editor/rich-text-editor-value';
import { BaseEditorKit } from '../src/registry/components/editor/plugins-static';

const plugins = [...BaseEditorKit, AuthoredPlugin];

// The saved document holds its suggestions, so the authors start from what
// rejecting all of them leaves.
const base = projectAuthoredDocument(richTextEditorValue, {
  projection: 'accepted',
}).document.children;

// Keep existing-text edits independent of the later suggested link insertion.
const bob = createEditor({
  plugins,
  initialValue: { children: base },
  userId: 'bob',
});

bob.update((tx) => {
  const offset = 'Review and refine content seamlessly. Use  or to '.length;

  tx.authored.propose();
  tx.text.delete({
    at: {
      anchor: { offset, path: [3, 0] },
      focus: { offset: offset + 'mark text for removal'.length, path: [3, 0] },
    },
  });
});
const charlie = createEditor({
  plugins,
  initialValue: bob.read.value(),
  userId: 'charlie',
});
let overlapChangeId = '';
charlie.update((tx) => {
  overlapChangeId = tx.authored.propose();
  tx.text.insert('overlapping ', {
    at: {
      offset: ' on many text segments. You can even have '.length,
      // Bob's deleted text stays in the document as its own node.
      path: [3, 4],
    },
  });
});
const editor = createEditor({
  plugins,
  initialValue: charlie.read.value(),
  userId: 'alice',
});
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
    // An empty text follows the inline link, so the added text is fourth.
    focus: { path: [3, 3], offset: ' like this added text'.length },
  },
  { association: 'inward', deletion: 'nearest' }
);
const comments: CommentsJSON = {
  kind: 'comments',
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
