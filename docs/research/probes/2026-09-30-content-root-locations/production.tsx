// Production rerun of the frozen content-root cost contract (plan S5).
// Parts: `roots` and `features` measure the adopted code; `stream` renders a
// streamed static preview with the adopted code (`candidate`) or the
// hash-verified pre-change sources (`baseline`), served in memory.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const part = process.argv[2];
const arm = process.argv[3] ?? 'candidate';
if (!['roots', 'features', 'stream'].includes(part)) throw new Error('Unknown part');
if (!['candidate', 'baseline'].includes(arm)) throw new Error('Unknown arm');
if (part !== 'stream' && arm !== 'candidate') throw new Error('Only stream has a baseline arm');

const sha = (value: string) => createHash('sha256').update(value).digest('hex');
const counters = { indexBuilds: 0, validations: 0 };
Object.assign(globalThis, { contentRootProductionCounters: counters });

// Pre-change sources: reconstructed files whose hashes match the design
// record, or HEAD where every hunk of the current diff belongs to this plan.
const baselineDir = process.env.CONTENT_ROOT_BASELINE_DIR;
const baselineSources: Record<string, { from: string; sha256: string }> = {
  'packages/platejs/src/static/components/PlateStatic.tsx': {
    from: 'dir',
    sha256: '57608045c0036398969839545981aed18f663404d8b8801b33353890d3f8db9e',
  },
  'packages/platejs/src/internal/plugin/getPlateDecorationSources.ts': {
    from: 'dir',
    sha256: 'fb221beac3614839f46ef59e24c3caf52ac30a674a7de75a57d60e037ce54bd5',
  },
  'packages/platejs/src/features/list/lib/BaseListPlugin.ts': {
    from: 'dir',
    sha256: '8b98d3dcab9aa08b63632bf51c4f5d040fb675ff19e7f4f70e49eee24c6b2f24',
  },
  'packages/platejs/src/features/table/lib/BaseTablePlugin.ts': {
    from: 'head',
    sha256: 'c242baaf15c7ae5286543dda65154c1ca63508dd0866dc0aab8296a08c208456',
  },
  'packages/platejs/src/static/internal/staticDocumentView.ts': {
    from: 'head',
    sha256: 'cee8a70f2a7849adf5bcb81a657b8d1aa431555a52b197f8b46f6ac0cdff5427',
  },
  'packages/plitejs/src/editor-runtime-view.ts': {
    from: 'head',
    sha256: '430759b02f47795b800fe0a874de3d120a74650b405bc020491b823766819c93',
  },
};
const loadBaseline = (file: string) => {
  const { from, sha256 } = baselineSources[file];
  const contents =
    from === 'head'
      ? execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' })
      : readFileSync(path.join(getBaselineDir(), path.basename(file)), 'utf8');

  assert.equal(sha(contents), sha256, `baseline hash mismatch: ${file}`);
  return contents;
};
const getBaselineDir = () => {
  if (!baselineDir) throw new Error('Set CONTENT_ROOT_BASELINE_DIR for the baseline arm');
  return baselineDir;
};

const countValidations = (source: string) =>
  source
    .replace(
      '  editor.read.schema.assertDocument(document);',
      '  globalThis.contentRootProductionCounters.validations++;\n  editor.read.schema.assertDocument(document);'
    )
    .replace(
      '    sourceEditor.read.schema.assertDocument(options.document);',
      '    globalThis.contentRootProductionCounters.validations++;\n    sourceEditor.read.schema.assertDocument(options.document);'
    );

Bun.plugin({
  name: 'content-root-production-counters',
  setup(build) {
    build.onLoad({ filter: /\/plitejs\/src\/core\/snapshot-index\.ts$/ }, (args) => ({
      contents: readFileSync(args.path, 'utf8').replaceAll(
        'if (materializedEntries) return materializedEntries;',
        'if (materializedEntries) return materializedEntries;\n    globalThis.contentRootProductionCounters.indexBuilds++;'
      ),
      loader: 'ts',
    }));
    build.onLoad({ filter: /\/plitejs\/src\/editor-runtime-view\.ts$/ }, (args) => ({
      contents: countValidations(
        arm === 'baseline'
          ? loadBaseline('packages/plitejs/src/editor-runtime-view.ts')
          : readFileSync(args.path, 'utf8')
      ),
      loader: 'ts',
    }));
    if (arm === 'baseline') {
      for (const file of Object.keys(baselineSources)) {
        if (file.includes('/plitejs/')) continue;
        const escaped = file.replace('packages/', '/').replaceAll('.', '\\.');
        build.onLoad({ filter: new RegExp(`${escaped}$`) }, () => ({
          contents: loadBaseline(file),
          loader: file.endsWith('.tsx') ? 'tsx' : 'ts',
        }));
      }
    }
  },
});

const median = (values: number[]) =>
  [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
const paragraph = (text: string) => ({ type: 'paragraph', children: [{ text }] });

const runRoots = async () => {
  const { createEditor, createEditorView, definePlugin, NodeApi } = await import('plitejs');
  const probe = definePlugin('probe', {
    read: ({ state }) => ({ text: () => NodeApi.string(state.nodes.get([0])?.[0]!) }),
  });
  const cohorts: unknown[] = [];

  for (const [bytes, roots] of [[10_000, 2], [50_000, 10], [50_000, 100], [50_000, 1000]]) {
    const names = Array.from({ length: roots }, (_, index) => `caption:${index}`);
    const samples: Array<Record<string, number>> = [];

    for (let packet = 0; packet < 8; packet++) {
      const source = createEditor({ plugins: [probe], initialValue: { children: [paragraph('SOURCE')] } });
      const document = {
        children: [paragraph('P'.repeat(bytes - roots * 12))],
        roots: Object.fromEntries(names.map((name) => [name, [paragraph(name)]])),
      };
      const before = JSON.stringify(source.read.runtime.snapshot());
      counters.validations = 0;
      counters.indexBuilds = 0;
      const captureStart = performance.now();
      const documentView = createEditorView(source, { document });
      const capture = performance.now() - captureStart;
      const views = new Map<string, ReturnType<typeof createEditorView>>();
      const read = () =>
        names
          .map((root) => {
            let view = views.get(root);
            if (!view) {
              view = createEditorView(documentView, { root });
              views.set(root, view);
            }
            return view.read.probe.text();
          })
          .join('|');
      const coldStart = performance.now();
      assert.equal(read(), names.join('|'));
      const cold = performance.now() - coldStart;
      const warmStart = performance.now();
      assert.equal(read(), names.join('|'));
      const warm = performance.now() - warmStart;
      const derivedValidations = counters.validations;
      // Explicit per-root document views reuse the document's validation.
      const explicitStart = performance.now();
      const explicit = names
        .map((root) => createEditorView(source, { document, root }).read.probe.text())
        .join('|');
      const explicitCold = performance.now() - explicitStart;
      assert.equal(explicit, names.join('|'));
      const view = views.get(names[0])!;
      assert.equal(view.read.view.root(), names[0]);
      assert.equal(view.read.view.isReadOnly(), true);
      assert.equal(createEditorView(view).read.probe.text(), 'P'.repeat(bytes - roots * 12));
      assert.throws(() => view.update((tx) => tx.text.insert('!')));
      assert.equal(before, JSON.stringify(source.read.runtime.snapshot()));

      if (packet >= 2) {
        samples.push({
          capture,
          cold,
          explicitCold,
          explicitValidations: counters.validations - derivedValidations,
          indexBuilds: counters.indexBuilds,
          totalCold: capture + cold,
          validations: derivedValidations,
          warm,
        });
      }
    }

    cohorts.push({
      bytes,
      roots,
      medianMs: Object.fromEntries(
        ['capture', 'cold', 'warm', 'totalCold', 'explicitCold'].map((key) => [
          key,
          median(samples.map((sample) => sample[key])),
        ])
      ),
      counts: {
        explicitValidations: Math.max(...samples.map((sample) => sample.explicitValidations)),
        indexBuilds: Math.max(...samples.map((sample) => sample.indexBuilds)),
        validations: Math.max(...samples.map((sample) => sample.validations)),
      },
      samples,
    });
  }

  return { cohorts };
};

const createFeatureKit = async () => {
  const { definePlugin, schema } = await import('platejs');
  const { BaseListPlugin } = await import('../../../../packages/platejs/src/features/list/lib/BaseListPlugin');
  const table = await import('../../../../packages/platejs/src/features/table/lib/BaseTablePlugin');
  const Figure = definePlugin('figure', {
    schema: {
      element: {
        contentRoots: {
          caption: {
            content: schema.content.types(['paragraph', 'table'], { default: { type: 'paragraph' }, min: 1 }),
            ownership: 'exclusive',
          },
        },
        blockContent: true,
        void: 'block',
      },
    },
  });

  return { BaseListPlugin, Figure, ...table };
};
const listItem = (text: string) => ({ ...paragraph(text), indent: 1, listType: 'numbered' });
const tableNode = () => ({
  type: 'table',
  columnWidths: [300],
  children: [{ type: 'tableRow', height: 72, children: [{ type: 'tableCell', borders: { bottom: { width: 4, style: 'solid', color: 'red' } }, children: [paragraph('cell')] }] }],
});

const runFeatures = async () => {
  const { createEditor, createEditorView } = await import('platejs');
  const { BaseListPlugin, BaseTablePlugin, Figure } = await createFeatureKit();
  const cohorts: unknown[] = [];

  for (const unrelated of [20, 500]) {
    const samples: Array<Record<string, number>> = [];

    for (let packet = 0; packet < 8; packet++) {
      const editor = createEditor({ plugins: [BaseListPlugin, BaseTablePlugin, Figure] });
      const document = {
        children: [
          ...Array.from({ length: unrelated }, () => paragraph('unrelated'.repeat(11))),
          listItem('first'),
          listItem('second'),
          tableNode(),
          { type: 'figure', childRoots: { caption: 'caption' }, children: [{ text: '' }] },
        ],
        roots: { caption: [listItem('caption first'), listItem('caption second'), tableNode()] },
      };
      const read = (target: 'path' | 'node') => {
        const primary = createEditorView(editor, { document: structuredClone(document) });
        const readers = [primary, createEditorView(primary, { root: 'caption' })];
        counters.indexBuilds = 0;
        const start = performance.now();
        const output = readers.map((view, index) => {
          const ordinals = [0, 1].map((offset) => {
            const at = [index ? offset : unrelated + offset];
            return view.read.list.ordinal(target === 'path' ? at : view.read.nodes.get(at)![0]);
          });
          const cellPath = [index ? 2 : unrelated + 2, 0, 0];
          const info = view.read.table.cell({ at: target === 'path' ? cellPath : view.read.nodes.get(cellPath)![0] });
          return { bottom: info?.borders.bottom.width, height: info?.size.minHeight, ordinals, root: info?.root, width: info?.size.width };
        });
        const duration = performance.now() - start;

        assert.deepEqual(output, [
          { bottom: 4, height: 72, ordinals: [1, 2], root: undefined, width: 300 },
          { bottom: 4, height: 72, ordinals: [1, 2], root: 'caption', width: 300 },
        ]);
        return { duration, indexBuilds: counters.indexBuilds };
      };
      const path = read('path');
      const node = read('node');

      if (packet >= 2) {
        samples.push({ nodeIndexBuilds: node.indexBuilds, nodeMs: node.duration, pathIndexBuilds: path.indexBuilds, pathMs: path.duration });
      }
    }

    cohorts.push({
      unrelated,
      medianMs: { node: median(samples.map((sample) => sample.nodeMs)), path: median(samples.map((sample) => sample.pathMs)) },
      counts: {
        nodeIndexBuilds: Math.max(...samples.map((sample) => sample.nodeIndexBuilds)),
        pathIndexBuilds: Math.max(...samples.map((sample) => sample.pathIndexBuilds)),
      },
      samples,
    });
  }

  return { cohorts };
};

const runStream = async () => {
  const { GlobalRegistrator } = await import('@happy-dom/global-registrator');
  GlobalRegistrator.register();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const React = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { createEditor, definePlugin } = await import('platejs');
  const { EditorElement, EditorStatic } = await import('platejs/static');
  const { BaseListPlugin, BaseTableCellPlugin, BaseTablePlugin, Figure } = await createFeatureKit();
  const byPath = arm === 'candidate';
  const h = React.createElement;
  const ListWrapper = ({ element }: any) =>
    element.listType === 'numbered'
      ? (props: any) =>
          h('ol', { start: props.editor.plugin(BaseListPlugin).read.ordinal(byPath ? props.path : props.element) }, h('li', null, props.children))
      : undefined;
  const Cell = (props: any) => {
    const info = props.editor.plugin(BaseTablePlugin).read.cell({ at: byPath ? props.path : props.element });
    return h(EditorElement, { ...props, as: 'td', attributes: { ...props.attributes, 'data-width': info?.size.width, 'data-bottom': info?.borders.bottom?.width } });
  };
  const Highlight = definePlugin('highlight', {
    decorate: {
      read: ({ entry: [node, nodePath] }: any) => {
        if (typeof node.text !== 'string') return [];
        const decorations = [];
        for (const match of node.text.matchAll(/the/g)) {
          decorations.push({
            attributes: { 'data-highlight': '' },
            key: `the:${nodePath.join('.')}:${match.index}`,
            range: { anchor: { offset: match.index, path: nodePath }, focus: { offset: match.index + 3, path: nodePath } },
          });
        }
        return decorations;
      },
    },
  });
  const editor = createEditor({
    plugins: [BaseListPlugin.configure({ slots: { wrapNodeChildren: ListWrapper } }), BaseTablePlugin, BaseTableCellPlugin.configure({ component: Cell }), Figure, Highlight],
  });
  const text = (index: number, cjk: boolean) =>
    cjk ? '这是第几段落的文字内容，用于测试流式预览的渲染成本。'.repeat(2) + index : `Block ${index} keeps the preview honest with the other text in the stream.`;
  const block = (index: number, cjk: boolean) =>
    index % 7 === 3 || index % 7 === 4 ? listItem(text(index, cjk)) : index % 11 === 6 ? tableNode() : paragraph(text(index, cjk));
  const cells: unknown[] = [];

  for (const cjk of [false, true]) {
    for (const bytes of [10_000, 50_000]) {
      const blocks: any[] = [];
      let size = 0;
      while (size < bytes) {
        const next = block(blocks.length, cjk);
        blocks.push(next);
        size += JSON.stringify(next).length;
      }
      const publications = Array.from({ length: 16 }, (_, index) => ({
        children: blocks.slice(0, Math.max(1, Math.ceil((blocks.length * (index + 1)) / 16))),
      }));
      const runs: Array<Record<string, number | string>> = [];

      for (let packet = 0; packet < 5; packet++) {
        const container = document.createElement('div');
        const root = createRoot(container);
        const times: number[] = [];
        counters.indexBuilds = 0;
        for (const publication of publications) {
          const start = performance.now();
          React.act(() => root.render(h(EditorStatic, { document: publication, editor })));
          times.push(performance.now() - start);
        }
        const html = container.innerHTML;
        React.act(() => root.unmount());
        if (packet >= 1) {
          runs.push({ html: sha(html), indexBuilds: counters.indexBuilds, medianPublicationMs: median(times), totalMs: times.reduce((sum, time) => sum + time, 0) });
        }
      }
      assert.equal(new Set(runs.map((run) => run.html)).size, 1);
      cells.push({
        blocks: blocks.length,
        bytes,
        cjk,
        html: runs[0].html,
        indexBuilds: Math.max(...runs.map((run) => Number(run.indexBuilds))),
        medianPublicationMs: median(runs.map((run) => Number(run.medianPublicationMs))),
        medianTotalMs: median(runs.map((run) => Number(run.totalMs))),
        runs,
      });
    }
  }

  return { cells };
};

const result = part === 'roots' ? await runRoots() : part === 'features' ? await runFeatures() : await runStream();
const sourceFiles = [
  'packages/plitejs/src/editor-runtime-view.ts',
  'packages/plitejs/src/core/snapshot-index.ts',
  'packages/platejs/src/static/components/PlateStatic.tsx',
  'packages/platejs/src/static/internal/staticDocumentView.ts',
  'packages/platejs/src/internal/plugin/getPlateDecorationSources.ts',
  'packages/platejs/src/features/list/lib/BaseListPlugin.ts',
  'packages/platejs/src/features/table/lib/BaseTablePlugin.ts',
  'pnpm-lock.yaml',
  'docs/research/probes/2026-09-30-content-root-locations/production.tsx',
];

console.log(
  JSON.stringify(
    {
      arm,
      host: { arch: process.arch, cpu: os.cpus()[0]?.model, load: os.loadavg(), platform: process.platform },
      part,
      runtime: Bun.version,
      sampling: part === 'stream' ? 'one warmup; four measured runs of 16 publications' : 'two warmups; six measured packets',
      source: Object.fromEntries(sourceFiles.map((file) => [file, sha(readFileSync(file, 'utf8'))])),
      ...(arm === 'baseline'
        ? { baselineSources: Object.fromEntries(Object.entries(baselineSources).map(([file, { sha256 }]) => [file, sha256])) }
        : {}),
      ...result,
    },
    null,
    2
  )
);
