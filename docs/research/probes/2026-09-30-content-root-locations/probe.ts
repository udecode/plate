import assert from 'node:assert/strict';

import { createEditor, createEditorView, definePlugin } from 'plitejs';
import { withEditorDocumentProjection, withEditorRootChildren } from '../../../../packages/plitejs/src/core/public-state';

const paragraph = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const probePlugin = definePlugin('locationProbe', {
  api: ({ editor }) => ({ readText: () => editor.read.nodes.get([0, 0])?.[0] }),
});
const editor = createEditor({
  plugins: [probePlugin],
  initialValue: { children: [paragraph('SOURCE')], roots: { notes: [paragraph('SOURCE NOTES')] } },
});
const document = { children: [paragraph('PROJECTED')], roots: { notes: [paragraph('PROJECTED NOTES')] } };
const projected = createEditorView(editor, { document });
const derived = createEditorView(projected, { root: 'notes' });
const explicit = createEditorView(editor, { document, root: 'notes' });
const text = (view: typeof editor) => view.read.nodes.get([0, 0])?.[0];
const source = editor.read.runtime.snapshot();
const findings: Record<string, unknown> = {
  projectedMain: text(projected),
  derivedNamed: text(derived),
  explicitNamed: text(explicit),
  derivedReadOnly: derived.read.view.isReadOnly(),
  derivedPlugin: derived.api.locationProbe.readText(),
  explicitPlugin: explicit.api.locationProbe.readText(),
  derivedLiveNamed: text(createEditorView(createEditorView(editor), { root: 'notes' })),
  derivedLiveReadOnly: createEditorView(createEditorView(editor, { readOnly: true }), { root: 'notes' }).read.view.isReadOnly(),
};
try {
  derived.update((tx) => tx.text.insert('MUTATION', { at: { path: [0, 0], offset: 0 } }));
  findings.derivedUpdate = 'accepted';
} catch (error) {
  findings.derivedUpdate = String(error);
}
findings.sourceUnchanged = JSON.stringify(source) === JSON.stringify(editor.read.runtime.snapshot());
assert.deepEqual(text(explicit), { text: 'PROJECTED NOTES' });
assert.equal(explicit.read.view.isReadOnly(), true);

// The direct scope is a control/prototype, not a new production facade.
const direct = editor.read((state) =>
  withEditorDocumentProjection(editor, document, () =>
    withEditorRootChildren(editor, 'notes', () => state.nodes.get([0, 0])?.[0]),
    { root: 'notes', selection: null }
  )
);
assert.deepEqual(direct, { text: 'PROJECTED NOTES' });
console.log(JSON.stringify({ kind: 'view-composition', findings, direct }, null, 2));
