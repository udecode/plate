import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';

import { getStaticRootView } from '../../../../packages/platejs/src/static/internal/staticDocumentView';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const source = createEditor({
  plugins: [authored({ authorId: 'alice' })],
  initialValue: {
    children: [paragraph('Body')],
    roots: { notes: [paragraph('Foot')] },
  },
});
const owner = createEditorView(source, {
  authored: { intent: 'propose', projection: 'proposed' },
});
const first = getStaticRootView(owner as never, 'notes');
first.update.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
assert.equal(first.read.text.string([]), 'Foot draft');
assert.deepEqual(source.read.root('notes'), [paragraph('Foot')]);

owner.api.authored.setView({ intent: 'edit', projection: 'accepted' });
const cached = getStaticRootView(owner as never, 'notes');
const fresh = createEditorView(owner, { root: 'notes' });
assert.equal(fresh.read.text.string([]), 'Foot');
assert.deepEqual(fresh.read.authored.view(), {
  intent: 'edit',
  projection: 'accepted',
});

const inputs = [
  'packages/platejs/src/static/internal/staticDocumentView.ts',
  'packages/plitejs/src/editor-runtime-view.ts',
  'packages/plitejs/src/core/authored-runtime.ts',
  'docs/research/probes/2026-09-30-content-root-locations/static-policy-review.ts',
];
console.log(
  JSON.stringify(
    {
      scenario: 'Static root reader after its owner switches to accepted mode',
      initialText: 'Foot draft',
      ownerPolicy: owner.read.authored.view(),
      cachedPolicy: cached.read.authored.view(),
      freshPolicy: fresh.read.authored.view(),
      cachedText: cached.read.text.string([]),
      freshText: fresh.read.text.string([]),
      cachedIdentityReused: cached === first,
      sameResult: cached.read.text.string([]) === fresh.read.text.string([]),
      source: Object.fromEntries(
        inputs.map((path) => [
          path,
          createHash('sha256').update(readFileSync(path)).digest('hex'),
        ])
      ),
      limits: 'Source-built helper probe; no React mount or browser run.',
    },
    null,
    2
  )
);
