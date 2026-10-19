import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const mode = process.argv[2] ?? 'current';
if (!['current', 'path-prototype'].includes(mode)) throw new Error('Unknown mode');
const counters = { indexBuilds: 0 };
Object.assign(globalThis, { contentRootFeatureCounters: counters });
const tableFile = 'packages/platejs/src/features/table/lib/BaseTablePlugin.ts';
const tableSource = readFileSync(tableFile, 'utf8');
const cellOpening = '        cell: (options: { at?: TableCellTarget } = {}) => {\n';
const listFile = 'packages/platejs/src/features/list/lib/BaseListPlugin.ts';
const listSource = readFileSync(listFile, 'utf8');
const listPath = '  const path = state.nodes.path(element);';
assert.equal(tableSource.split(cellOpening).length, 2);
assert.equal(listSource.split(listPath).length, 2);
const targetTable = tableSource.replace(cellOpening, cellOpening + `
          if (PathApi.isPath(options.at)) {
            const entry = state.nodes.get(options.at, { match: ElementApi.isElement });
            if (!entry || entry[0].type !== editor.plugin(BaseTableCellPlugin).schema.type) return null;
            const parent = state.nodes.above({ at: options.at, type });
            if (!parent) return null;
            const [table, tablePath] = parent;
            const context = createDetachedTableContext(table, tablePath);
            const anchor = context.anchorAtPath(options.at);
            if (!anchor) return null;
            return cellInfo({ table, context, anchor, anchors: [anchor], root: state.view.root() });
          }
`);
// Preserve the real shared numbering algorithm; replace only target recovery.
const targetList = listSource.replace('): number | undefined => {\n  if (element.listType', `): number | undefined => {
  const targetPath = PathApi.isPath(element) ? element : undefined;
  if (targetPath) element = state.nodes.get(targetPath, { match: ElementApi.isElement })?.[0];
  if (!element) return undefined;
  if (element.listType`).replace(listPath, `  const path = targetPath ?? state.nodes.path(element);
  if (!path) return undefined;`);
Bun.plugin({ name: 'disposable-path-only-features', setup(build) {
  build.onLoad({ filter: /\/plitejs\/src\/core\/snapshot-index\.ts$/ }, args => ({
    contents: readFileSync(args.path,'utf8').replaceAll('if (materializedEntries) return materializedEntries;',
      'if (materializedEntries) return materializedEntries;\n    globalThis.contentRootFeatureCounters.indexBuilds++;'), loader: 'ts'
  }));
  if (mode === 'path-prototype') {
    build.onLoad({ filter: /\/features\/table\/lib\/BaseTablePlugin\.ts$/ }, () => ({ contents: targetTable, loader: 'ts' }));
  }
  build.onLoad({ filter: /\/features\/list\/lib\/BaseListPlugin\.ts$/ }, () => ({ contents: (mode === 'path-prototype' ? targetList : listSource) + '\nexport { getDocumentListOrdinal };\n', loader: 'ts' }));
} });
const { createEditor, definePlugin, schema } = await import('platejs');
const { createEditorView } = await import('plitejs');
const { BaseListPlugin, getDocumentListOrdinal } = await import('../../../../packages/platejs/src/features/list/lib/BaseListPlugin');
const { BaseTablePlugin } = await import('platejs/table');
const paragraph = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const list = (text: string) => ({ ...paragraph(text), indent: 1, listType: 'numbered' });
const table = () => ({ type: 'table', columnWidths: [300], children: [{ type: 'tableRow', height: 72, children: [{ type: 'tableCell', borders: { bottom: { width: 4, style: 'solid', color: 'red' } }, children: [paragraph('cell')] }] }] });
const Figure = definePlugin('figure', { schema: { element: {
  contentRoots: { caption: { content: schema.content.types(['paragraph','table'], { default: { type: 'paragraph' }, min: 1 }), ownership: 'exclusive' } },
  blockContent: true, void: 'block'
} } });
const results: unknown[] = [];
for (const unrelated of [20, 500]) {
  const samples = [];
  for (let packet = 0; packet < 8; packet++) {
    const editor = createEditor({ plugins: [BaseListPlugin, BaseTablePlugin, Figure] });
    const children = [...Array.from({ length: unrelated }, () => paragraph('unrelated'.repeat(11))), list('first'), list('second'), table(), { type: 'figure', childRoots: { caption: 'caption' }, children: [{ text: '' }] }];
    const document = { children, roots: { caption: [list('caption first'), list('caption second'), table()] } };
    const readers = [createEditorView(editor, { document }), createEditorView(editor, { document, root: 'caption' })];
    const nodeOrdinals = readers.map((view, index) => [0,1].map(offset => view.read.list.ordinal(view.read.nodes.get([index ? offset : unrelated + offset])![0])));
    assert.deepEqual(nodeOrdinals, [[1,2],[1,2]]);
    const path = [unrelated + 2, 0, 0];
    const baselineInfo = readers[0].read.table.cell({ at: path });
    assert.equal(baselineInfo?.size.width, 300);
    assert.equal(baselineInfo?.size.minHeight, 72);
    assert.equal(baselineInfo?.borders.bottom.width, 4);
    // A fresh document identity avoids inheriting indexes built by controls.
    const copy = structuredClone(document);
    const freshReaders = [createEditorView(editor, { document: copy }), createEditorView(editor, { document: copy, root: 'caption' })];
    counters.indexBuilds = 0;
    const start = performance.now();
    const output = freshReaders.map((view, index) => {
      const ordinals = [0,1].map(offset => {
        const at = [index ? offset : unrelated + offset];
        return view.read.list.ordinal(mode === 'current' ? view.read.nodes.get(at)![0] : at);
      });
      const info = view.read.table.cell({ at: [index ? 2 : unrelated + 2, 0, 0] });
      return { ordinals, width: info?.size.width, height: info?.size.minHeight, bottom: info?.borders.bottom.width, root: info?.root };
    });
    const duration = performance.now() - start;
    assert.deepEqual(output.map(({ordinals,width,height,bottom}) => ({ordinals,width,height,bottom})), Array(2).fill({ordinals:[1,2],width:300,height:72,bottom:4}));
    assert.equal(output[0].root, undefined); assert.equal(output[1].root, 'caption');
    const main = freshReaders[0];
    const captured = main.read.nodes.get([0])![0];
    const detached = getDocumentListOrdinal(copy, 'caption', copy.roots.caption[1], [1], {}, undefined);
    assert.equal(detached, 2);
    assert.equal(main.read.nodes.get([0])![0], captured);
    if (packet >= 2) samples.push({ duration, indexBuilds: counters.indexBuilds });
  }
  results.push({ unrelated, samples, correctness: 'pass' });
}
const sha = (value: string) => createHash('sha256').update(value).digest('hex');
console.log(JSON.stringify({mode,runtime:Bun.version,tableTransform:sha(targetTable),listTransform:sha(targetList),source:Object.fromEntries([tableFile,listFile,'packages/platejs/src/features/table/lib/internal/context.ts','packages/platejs/src/features/table/lib/internal/grid.ts','packages/platejs/src/features/table/lib/internal/selection.ts','packages/plitejs/src/core/snapshot-index.ts','docs/research/probes/2026-09-30-content-root-locations/features.ts'].map(file=>[file,sha(readFileSync(file,'utf8'))])), results},null,2));
