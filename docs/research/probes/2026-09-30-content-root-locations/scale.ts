import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode = process.argv[2] ?? 'current';
if (!['current', 'scoped-prototype'].includes(mode)) throw new Error('Unknown mode');
const counters = { validations: 0, views: 0, indexBuilds: 0 };
Object.assign(globalThis, { contentRootProbeCounters: counters });
const viewSource = path.resolve('packages/plitejs/src/editor-runtime-view.ts');
const original = readFileSync(viewSource, 'utf8');
const opening = '): EditorView<V, TPlugins> => {\n  if (options.document) {';
const validation = '    sourceEditor.read.schema.assertDocument(options.document);';
assert.equal(original.split(opening).length, 2);
assert.equal(original.split(validation).length, 2);
let transformed = original.replace(validation,
  '    globalThis.contentRootProbeCounters.validations++;\n' + validation);
transformed = transformed.replace('  return Object.freeze(view);',
  '  globalThis.contentRootProbeCounters.views++;\n  return Object.freeze(view);');
if (mode === 'scoped-prototype') {
  transformed = 'const PROBE_CAPTURE = new WeakMap();\n' + original;
  transformed = transformed.replace(opening, `): EditorView<V, TPlugins> => {
  const layeredSource = sourceEditor;
  const sourceReadOnly = sourceEditor.read.view.isReadOnly();
  const sourceAuthored = readAuthoredView(sourceEditor);
  const captured = PROBE_CAPTURE.get(sourceEditor);
  if (captured && options.authored) throw new Error('A document view cannot take an authored projection.');
  options = { ...options, document: options.document ?? captured?.document,
    readOnly: sourceReadOnly || options.readOnly,
    authored: options.document || captured?.document ? options.authored : options.authored ?? sourceAuthored };
  sourceEditor = getEditorRuntimeOwner(sourceEditor);
  if (options.document) {`);
  transformed = transformed.replace('  getAuthoredViewCommit,', '  getAuthoredViewCommit,\n  readAuthoredView,');
  transformed = transformed.replace('Reflect.ownKeys(sourceEditor)', 'Reflect.ownKeys(layeredSource)').replace('Object.getOwnPropertyDescriptor(sourceEditor, key)', 'Object.getOwnPropertyDescriptor(layeredSource, key)');
  transformed = transformed.replace('inheritPluginRegistry(viewEditor, sourceEditor)', 'inheritPluginRegistry(viewEditor, layeredSource)').replace('createEditorViewPluginApis(viewEditor, sourceEditor)', 'createEditorViewPluginApis(viewEditor, layeredSource)');
  transformed = transformed.replace(validation, `    if (!captured || captured.document !== options.document) {
      globalThis.contentRootProbeCounters.validations++;
      sourceEditor.read.schema.assertDocument(options.document);
    }`);
  transformed = transformed.replace('  return Object.freeze(view);', `  if (options.document) PROBE_CAPTURE.set(view, { source: sourceEditor, document: options.document, root: options.root });
  globalThis.contentRootProbeCounters.views++;
  return Object.freeze(view);`);
}
Bun.plugin({ name: 'disposable-content-root-prototype', setup(build) {
  build.onLoad({ filter: /\/plitejs\/src\/editor-runtime-view\.ts$/ }, () => ({ contents: transformed, loader: 'ts' }));
  build.onLoad({ filter: /\/plitejs\/src\/core\/snapshot-index\.ts$/ }, args => ({
    contents: readFileSync(args.path, 'utf8').replaceAll(
      'if (materializedEntries) return materializedEntries;',
      'if (materializedEntries) return materializedEntries;\n    globalThis.contentRootProbeCounters.indexBuilds++;'
    ), loader: 'ts'
  }));
} });
const { createEditor, createEditorView, definePlugin, NodeApi } = await import('plitejs');
const { withEditorDocumentProjection, withEditorRootChildren } = await import('../../../../packages/plitejs/src/core/public-state');
const { withDocumentViewRead } = await import('../../../../packages/plitejs/src/core/document-view-read');
const paragraph = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const probe = definePlugin('probe', {
  api: ({ editor }) => ({ text: () => NodeApi.string(editor.read.nodes.get([0])?.[0]!) }),
  read: ({ state }) => ({ text: () => NodeApi.string(state.nodes.get([0])?.[0]!) }),
});
const samples: unknown[] = [];
const compositionSource = createEditor({ plugins: [probe], initialValue: { children: [paragraph('SOURCE')], roots: { notes: [paragraph('SOURCE NOTES')] } } });
const parent = createEditorView(compositionSource);
const child = createEditorView(parent, { root: 'notes' });
const readOnlyParent = createEditorView(compositionSource, { readOnly: true });
const readOnlyChild = createEditorView(readOnlyParent, { root: 'notes', readOnly: false });
const composition = { named: child.read.probe.text(), namedRoot: child.read.view.root(), readOnly: readOnlyChild.read.view.isReadOnly(), independent: child !== createEditorView(parent, { root: 'notes' }) };
if (mode === 'scoped-prototype') {
  assert.equal(composition.named, 'SOURCE NOTES'); assert.equal(composition.namedRoot, 'notes'); assert.equal(composition.readOnly, true); assert.equal(composition.independent, true);
  child.update(tx => tx.text.insert('!', { at: { path: [0,0], offset: 12 } }));
  assert.equal(compositionSource.read.root('notes')[0].children[0].text, 'SOURCE NOTES!');
  assert.equal(compositionSource.read.children()[0].children[0].text, 'SOURCE');
  assert.throws(() => readOnlyChild.update(tx => tx.text.insert('bad')));
}
for (const [bytes, roots] of [[10_000, 2], [50_000, 10], [50_000, 100], [50_000, 1000]]) {
  const mainText = 'P'.repeat(bytes - roots * 12);
  const names = Array.from({ length: roots }, (_, index) => `caption:${index}`);
  const document = { children: [paragraph(mainText)], roots: Object.fromEntries(names.map(name => [name, [paragraph(name)]])) };
  const timings = { control: [] as number[], capture: [] as number[], cold: [] as number[], totalCold: [] as number[], warm: [] as number[] };
  const counts: unknown[] = [];
  for (let packet = 0; packet < 8; packet++) {
    const source = createEditor({ plugins: [probe], initialValue: { children: [paragraph('SOURCE')] } });
    const before = JSON.stringify(source.read.runtime.snapshot());
    counters.validations = 0; counters.views = 0; counters.indexBuilds = 0;
    const captureStart = performance.now();
    const documentView = createEditorView(source, { document });
    const captureTime = performance.now() - captureStart;
    const expected = names.join('|');
    const control = () => source.read(state => withEditorDocumentProjection(source, document, () =>
      names.map(root => withEditorRootChildren(source, root, () => NodeApi.string(state.nodes.get([0])?.[0]!))).join('|'),
      { root: 'main', selection: null }
    ));
    let rootViews: ReturnType<typeof createEditorView>[];
    const scopedReaders = new Map<string, ReturnType<typeof createEditorView>>();
    const getScopedReader = (root: string) => {
      let view = scopedReaders.get(root);
      if (!view) { view = createEditorView(documentView, { root }); scopedReaders.set(root, view); }
      return view;
    };
    const cold = () => {
      rootViews = names.map(root => mode === 'current'
        ? createEditorView(source, { document, root })
        : getScopedReader(root));
      return rootViews.map(view => NodeApi.string(view.read.nodes.get([0])?.[0]!)).join('|');
    };
    const warm = () => names.map((root, index) => {
      const view = mode === 'current' ? rootViews[index] : getScopedReader(root);
      return NodeApi.string(view.read.nodes.get([0])?.[0]!);
    }).join('|');
    const measure = (fn: () => string) => {
      const start = performance.now();
      const output = fn();
      const duration = performance.now() - start;
      assert.equal(output, expected);
      return duration;
    };
    const first = packet % 2 ? { cold: measure(cold), control: measure(control) } : { control: measure(control), cold: measure(cold) };
    const warmTime = measure(warm);
    assert.equal(rootViews![0].read.view.isReadOnly(), true);
    assert.equal(rootViews![0].read.probe.text(), names[0]);
    assert.equal(rootViews![0].api.probe.text(), names[0]);
    assert.equal(rootViews![0].read.view.root(), names[0]);
    assert.throws(() => withDocumentViewRead(rootViews![0], () => source.read.children()));
    assert.throws(() => rootViews![0].update(tx => tx.text.insert('bad')));
    assert.equal(before, JSON.stringify(source.read.runtime.snapshot()));
    if (mode === 'scoped-prototype') assert.equal(getScopedReader(names[0]), rootViews![0]);
    if (packet >= 2) {
      timings.control.push(first.control); timings.capture.push(captureTime); timings.cold.push(first.cold); timings.totalCold.push(captureTime + first.cold); timings.warm.push(warmTime);
      counts.push({ ...counters });
    }
  }
  const median = (values: number[]) => [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)];
  samples.push({ payloadBytes: bytes, roots, jsonBytes: JSON.stringify(document).length, timings, medianMs: { control: median(timings.control), capture: median(timings.capture), cold: median(timings.cold), totalCold: median(timings.totalCold), warm: median(timings.warm) }, counts, correctness: 'pass' });
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const files = ['packages/plitejs/src/editor-runtime-view.ts','packages/plitejs/src/core/public-state.ts','packages/plitejs/src/core/editor-lifecycle-api.ts','packages/plitejs/src/core/snapshot-index.ts','packages/plitejs/src/core/plugin.ts','packages/plitejs/src/core/editor-runtime.ts','pnpm-lock.yaml','config/plite-source-aliases.ts','docs/research/probes/2026-09-30-content-root-locations/scale.ts'];
console.log(JSON.stringify({ mode, composition, runtime: Bun.version, host: { platform: process.platform, arch: process.arch, cpu: os.cpus()[0].model }, probeTransformSha256: hash(transformed), source: Object.fromEntries(files.map(file => [file, hash(readFileSync(file,'utf8'))])), sampleRule: '2 warmups; 6 packets; alternate control/cold order; no p95 claim', samples }, null, 2));
