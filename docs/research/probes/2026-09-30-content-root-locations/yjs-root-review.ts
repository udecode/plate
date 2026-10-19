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

import { getPlateDecorationSources } from '../../../../packages/platejs/src/internal/plugin/getPlateDecorationSources';
import { FakeAwareness } from '../../../../packages/plitejs/test/yjs/support/provider';

if (process.argv.includes('--without-root-filter')) {
  Bun.plugin({
    name: 'yjs-root-review-mutation',
    setup(build) {
      build.onLoad({ filter: /\/yjs\/react\/YjsPlugin\.tsx$/ }, ({ path }) => {
        const original = readFileSync(path, 'utf8');
        const contents = original.replace(
          /  const root = editor\.read\.view\.root\(\);\n\n  return selection &&\n    selection\.anchor\.root === root &&\n    selection\.focus\.root === root\n    \? selection\n    : null;/,
          '  return selection;'
        );
        assert.notEqual(contents, original, 'Mutation must remove the root filter.');
        return { contents, loader: 'tsx' };
      });
    },
  });
}
const { YjsPlugin } = await import('platejs/yjs/react');

const awareness = new FakeAwareness(2);
const doc = awareness.doc;
const Collaboration = YjsPlugin.create({
  awareness,
  doc,
  initialReady: true,
  seed: true,
});
const Figure = definePlugin('yjsRootReviewFigure', {
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
const editor = createEditor({
  plugins: [BaseParagraphPlugin, Figure, Collaboration],
  schema: { id: 'plate:yjs-root-review', version: 1 },
  initialValue: {
    children: [
      { type: 'paragraph', children: [{ text: 'Main text' }] },
      {
        type: 'yjsRootReviewFigure',
        children: [{ text: '' }],
        childRoots: { caption: 'caption:review' },
      },
    ],
    roots: {
      'caption:review': [{ type: 'paragraph', children: [{ text: 'Note text' }] }],
    },
  },
});
const caption = createEditorView(editor, { root: 'caption:review' });
const paint = getPlateDecorationSources(editor).find((source) => source.id === 'yjs');
assert.ok(paint);
const publish = (view: typeof editor | typeof caption) => {
  view.update.selection.set({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 4 },
  });
  view.api.yjs.syncSelection();
  const opaqueState = awareness.getLocalState();
  assert.ok(opaqueState);
  awareness.setRemoteState(101, opaqueState);
  assert.equal(editor.api.yjs.remoteCursors().length, 1);
};
const read = (view: typeof editor | typeof caption) => {
  const entry = view.read.nodes.get([0, 0]);
  assert.ok(entry);
  return paint.read({ editor: view, entry }).length;
};
publish(editor);
const primaryCursor = { primaryPaint: read(editor), captionPaint: read(caption) };
assert.deepEqual(primaryCursor, { primaryPaint: 1, captionPaint: 0 });
publish(caption);
const captionCursor = { primaryPaint: read(editor), captionPaint: read(caption) };
assert.deepEqual(captionCursor, { primaryPaint: 0, captionPaint: 1 });

const inputs = [
  'packages/platejs/src/yjs/react/YjsPlugin.tsx',
  'packages/platejs/src/internal/plugin/getPlateDecorationSources.ts',
  'packages/plitejs/test/yjs/support/provider.ts',
  'docs/research/probes/2026-09-30-content-root-locations/yjs-root-review.ts',
];
console.log(JSON.stringify({
  scenario: 'Canonical primary/named remote cursors at identical local paths',
  primaryCursor,
  captionCursor,
  wireConstruction: 'Public syncSelection produces opaque state; existing FakeAwareness copies it unchanged.',
  source: Object.fromEntries(inputs.map((path) => [
    path,
    createHash('sha256').update(readFileSync(path)).digest('hex'),
  ])),
  limits: 'Source-built Plate decoration boundary with one fake awareness instance; no network, browser or geometry proof.',
}, null, 2));
doc.destroy();
