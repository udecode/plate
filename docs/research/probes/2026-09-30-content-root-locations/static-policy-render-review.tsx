import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
  definePlugin,
  schema,
} from 'platejs';
import { authored } from 'platejs/authored';
import { EditorStatic } from 'platejs/static';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server.edge';

const Figure = definePlugin('rootReviewFigure', {
  component: ({ slots }) => (
    <figure><figcaption>{slots.contentRoot('caption')}</figcaption></figure>
  ),
  schema: {
    element: {
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      blockContent: true,
      void: 'block',
    },
  },
});
const source = createEditor({
  plugins: [BaseParagraphPlugin, Figure, authored({ authorId: 'alice' })],
  initialValue: {
    children: [{
      type: 'rootReviewFigure',
      children: [{ text: '' }],
      childRoots: { caption: 'caption:review' },
    }],
    roots: {
      'caption:review': [{ type: 'paragraph', children: [{ text: 'Foot' }] }],
    },
  },
});
const owner = createEditorView(source, {
  authored: { intent: 'propose', projection: 'proposed' },
});
const caption = createEditorView(owner, { root: 'caption:review' });
caption.update.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
const before = renderToStaticMarkup(<EditorStatic editor={owner} />);
assert.ok(before.includes('Foot draft'));
owner.api.authored.setView({ intent: 'edit', projection: 'accepted' });
const after = renderToStaticMarkup(<EditorStatic editor={owner} />);
const control = createEditorView(source, {
  authored: { intent: 'edit', projection: 'accepted' },
});
const fresh = renderToStaticMarkup(<EditorStatic editor={control} />);
assert.ok(fresh.includes('Foot'));
assert.ok(!fresh.includes('draft'));

const inputs = [
  'packages/platejs/src/static/internal/staticDocumentView.ts',
  'packages/platejs/src/static/components/PlateStatic.tsx',
  'packages/plitejs/src/editor-runtime-view.ts',
  'docs/research/probes/2026-09-30-content-root-locations/static-policy-render-review.tsx',
];
console.log(JSON.stringify({
  scenario: 'EditorStatic caption after its owner switches to accepted mode',
  before,
  after,
  fresh,
  staleProposedText: after.includes('draft'),
  sameResult: after === fresh,
  source: Object.fromEntries(inputs.map((path) => [
    path,
    createHash('sha256').update(readFileSync(path)).digest('hex'),
  ])),
  limits: 'Source-built React server rendering; no browser or client rerender proof.',
}, null, 2));
