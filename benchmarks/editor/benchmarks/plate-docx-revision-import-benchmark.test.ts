import { expect, spyOn, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';

import {
  createEditor,
  createEditorView,
  DocumentChange,
  NodeApi,
  BaseBoldPlugin,
  BaseHeadingPlugin,
  type Descendant,
} from 'platejs';
import { authored, readAuthoredFormatSnapshot } from 'platejs/authored';
import { exportToDocx } from 'platejs/docx/export';
import { importDocx } from 'platejs/docx/import';
import { BaseParagraphPlugin } from 'platejs/react';
import React from 'react';

import JSZip from '../../../packages/platejs/node_modules/jszip';
import mammoth from '../../../packages/platejs/node_modules/mammoth';

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const MEBIBYTE = 1024 * 1024;
const resultUrl = new URL(
  'results/plate-docx-revision-import-latest.json',
  import.meta.url
);

type Cohort = Readonly<{
  baselineMedianMs: number;
  maxMs: number;
  name: 'large' | 'normal' | 'pathological' | 'stress';
  paragraphs: number;
  revisions: number;
  samples: number;
}>;

type Fixture = Readonly<{
  accepted: readonly string[];
  bytes: ArrayBuffer;
  documentXmlBytes: number;
  proposed: readonly string[];
  revisionIds: readonly string[];
}>;

const cohorts: readonly Cohort[] = [
  {
    baselineMedianMs: 27.326,
    maxMs: 250,
    name: 'normal',
    paragraphs: 4,
    revisions: 4,
    samples: 20,
  },
  {
    baselineMedianMs: 139.885,
    maxMs: 500,
    name: 'large',
    paragraphs: 24,
    revisions: 16,
    samples: 20,
  },
  {
    baselineMedianMs: 777.777,
    maxMs: 1000,
    name: 'stress',
    paragraphs: 96,
    revisions: 48,
    samples: 20,
  },
  {
    baselineMedianMs: 3681.535,
    maxMs: 2000,
    name: 'pathological',
    paragraphs: 256,
    revisions: 96,
    samples: 20,
  },
];

const element = (document: Document, name: string) =>
  document.createElementNS(WORD_NAMESPACE, `w:${name}`);

const appendRun = (document: Document, parent: Element, text: string) => {
  const run = element(document, 'r');
  const value = element(document, 't');

  value.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
  value.textContent = text;
  run.append(value);
  parent.append(run);
};

const localElements = (document: Document, name: string) =>
  Array.from(document.getElementsByTagName('*')).filter(
    (node) => node.localName === name
  );

const buildFixture = async (
  baseBytes: ArrayBuffer,
  cohort: Cohort
): Promise<Fixture> => {
  const zip = await JSZip.loadAsync(baseBytes);
  const file = zip.file('word/document.xml');

  if (!file) throw new Error('Benchmark fixture has no main document part.');
  const document = new DOMParser().parseFromString(
    await file.async('string'),
    'application/xml'
  );
  const body = localElements(document, 'body')[0];

  if (!body) throw new Error('Benchmark fixture has no Word body.');
  const section = Array.from(body.children).find(
    (child) => child.localName === 'sectPr'
  );

  body.replaceChildren();
  const accepted = Array.from(
    { length: cohort.paragraphs },
    (_, index) => `base-${index}`
  );
  const proposed = [...accepted];
  const revisionIds: string[] = [];

  for (
    let paragraphIndex = 0;
    paragraphIndex < cohort.paragraphs;
    paragraphIndex++
  ) {
    const paragraph = element(document, 'p');

    appendRun(document, paragraph, accepted[paragraphIndex]);
    for (
      let revisionIndex = paragraphIndex;
      revisionIndex < cohort.revisions;
      revisionIndex += cohort.paragraphs
    ) {
      const id = String(revisionIndex + 1);
      const insertion = element(document, 'ins');
      const inserted = ` revision-${id}`;

      insertion.setAttributeNS(WORD_NAMESPACE, 'w:id', id);
      insertion.setAttributeNS(WORD_NAMESPACE, 'w:author', `author-${id}`);
      insertion.setAttributeNS(
        WORD_NAMESPACE,
        'w:date',
        new Date(Date.UTC(2026, 0, 1, 0, 0, revisionIndex)).toISOString()
      );
      appendRun(document, insertion, inserted);
      paragraph.append(insertion);
      proposed[paragraphIndex] += inserted;
      revisionIds.push(id);
    }
    body.append(paragraph);
  }
  if (section) body.append(section);
  const documentXml = new XMLSerializer().serializeToString(document);

  zip.file('word/document.xml', documentXml);

  return {
    accepted,
    bytes: await zip.generateAsync({ type: 'arraybuffer' }),
    documentXmlBytes: new TextEncoder().encode(documentXml).byteLength,
    proposed,
    revisionIds: revisionIds.sort(
      (left, right) => Number(left) - Number(right)
    ),
  };
};

const paragraphText = (nodes: readonly Descendant[]) =>
  nodes.map((node) => NodeApi.string(node));

const runImport = async (fixture: Fixture) => {
  const codec = createEditor({ plugins: [BaseParagraphPlugin] });
  const result = await importDocx(codec, fixture.bytes);

  if (!result.ok) throw new Error(result.diagnostics[0]?.message);
  const restored = createEditor({
    plugins: [BaseParagraphPlugin, authored({ authorId: 'reader' })],
    initialValue: result.document,
  });
  const proposed = createEditorView(restored, {
    authored: { intent: 'propose', projection: 'proposed' },
  });
  const guard = {
    accepted: paragraphText(restored.read.children()),
    proposed: paragraphText(proposed.read.children()),
    revisionIds: restored.read.authored
      .changes({ limit: fixture.revisionIds.length + 1 })
      .items.map(({ id }) => id),
  };

  expect(guard).toEqual({
    accepted: fixture.accepted,
    proposed: fixture.proposed,
    revisionIds: fixture.revisionIds,
  });

  return guard;
};

type WorkSpies = Readonly<{
  diff: ReturnType<typeof spyOn>;
  generate: ReturnType<typeof spyOn>;
  mammoth: ReturnType<typeof spyOn>;
  parse: ReturnType<typeof spyOn>;
}>;

const calls = (spy: ReturnType<typeof spyOn>) => spy.mock.calls.length;

const runMeasured = async (fixture: Fixture, spies: WorkSpies) => {
  const before = {
    diff: calls(spies.diff),
    generate: calls(spies.generate),
    mammoth: calls(spies.mammoth),
    parse: calls(spies.parse),
  };
  Bun.gc(true);
  const memoryBefore = process.memoryUsage();
  const scheduledAt = performance.now();
  let eventLoopDelayMs = 0;
  const timer = new Promise<void>((resolve) => {
    setTimeout(() => {
      eventLoopDelayMs = performance.now() - scheduledAt;
      resolve();
    }, 0);
  });
  const start = performance.now();

  await runImport(fixture);
  const durationMs = performance.now() - start;

  await timer;
  Bun.gc(true);
  const memoryAfter = process.memoryUsage();
  const xmlParses = spies.parse.mock.calls
    .slice(before.parse)
    .filter(([, mime]) => mime === 'application/xml').length;
  const work = {
    documentDiffs: calls(spies.diff) - before.diff,
    htmlConversions: calls(spies.mammoth) - before.mammoth,
    packageGenerations: calls(spies.generate) - before.generate,
    xmlParses,
    zipLoads: 1,
  };

  expect(work).toEqual({
    documentDiffs: 2,
    htmlConversions: 1,
    packageGenerations: 1,
    xmlParses: 1,
    zipLoads: 1,
  });

  return {
    durationMs,
    eventLoopDelayMs,
    heapDeltaBytes: Math.max(0, memoryAfter.heapUsed - memoryBefore.heapUsed),
    rssDeltaBytes: Math.max(0, memoryAfter.rss - memoryBefore.rss),
    work,
  };
};

const percentile = (values: readonly number[], fraction: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * fraction) - 1];
};

test('DOCX fidelity cohort preserves mixed revisions and rich comments', async () => {
  let authorId = 'alice';
  const HeadingPlugin = BaseHeadingPlugin.configure({
    component: ({ attributes, children, element: headingElement }) =>
      React.createElement(`h${headingElement.level}`, attributes, children),
  });
  const plugins = [
    BaseParagraphPlugin,
    HeadingPlugin,
    BaseBoldPlugin,
    authored({ authorId: () => authorId }),
  ];
  const editor = createEditor({
    plugins,
    initialValue: [
      { children: [{ text: 'ABCDE' }], type: 'paragraph' },
      { children: [{ text: 'Second' }], type: 'paragraph' },
    ],
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'markup' },
  });

  view.update.text.insert('XY', {
    at: {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    },
  });
  authorId = 'bob';
  view.update.nodes.set({ bold: true }, { at: [0, 0] });
  authorId = 'carol';
  view.update.nodes.set({ level: 1, type: 'heading' }, { at: [0] });
  authorId = 'dana';
  view.update.nodes.move({ at: [1], to: [0] });
  const snapshot = readAuthoredFormatSnapshot(editor);
  const exported = await exportToDocx(editor, {
    editorPlugins: [BaseParagraphPlugin, HeadingPlugin, BaseBoldPlugin],
    projection: 'review',
  });

  if (!exported.ok) throw new Error(exported.diagnostics[0]?.message);
  const zip = await JSZip.loadAsync(await exported.blob.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')!.async('string');

  expect(documentXml).toContain('<w:ins');
  expect(documentXml).toContain('<w:del');
  expect(documentXml).toContain('<w:moveFrom');
  expect(documentXml).toContain('<w:moveTo');
  expect(documentXml).toContain('<w:rPrChange');
  expect(documentXml).toContain('<w:pPrChange');
  zip.remove('editor/authored.json');
  const imported = await importDocx(
    editor,
    await zip.generateAsync({ type: 'arraybuffer' })
  );

  if (!imported.ok) throw new Error(imported.diagnostics[0]?.message);
  const restored = createEditor({ plugins, initialValue: imported.document });
  const restoredSnapshot = readAuthoredFormatSnapshot(restored);

  expect(restoredSnapshot.accepted.children).toEqual(
    snapshot.accepted.children
  );
  expect(restoredSnapshot.proposed.children).toEqual(
    snapshot.proposed.children
  );
  expect(restoredSnapshot.changes.map(({ authorId: id }) => id)).toEqual([
    'alice',
    'bob',
    'carol',
    'dana',
  ]);

  const commentEditor = createEditor({
    plugins: [BaseParagraphPlugin, BaseBoldPlugin],
    initialValue: [{ children: [{ text: 'Review this.' }], type: 'paragraph' }],
  });
  const commentExport = await exportToDocx(commentEditor, {
    comments: [
      {
        author: { initials: 'AL', name: 'Ada' },
        body: [
          {
            children: [{ bold: true, text: 'Rich comment' }],
            type: 'paragraph',
          },
        ],
        createdAt: null,
        durableId: 'A1B2C3D4',
        id: 'comment-1',
        parentId: null,
        resolved: false,
        target: {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 6, path: [0, 0] },
          },
        },
      },
    ],
    editorPlugins: [BaseParagraphPlugin, BaseBoldPlugin],
    projection: 'proposed',
  });

  if (!commentExport.ok) throw new Error(commentExport.diagnostics[0]?.message);
  const commentImport = await importDocx(
    commentEditor,
    await commentExport.blob.arrayBuffer()
  );

  if (!commentImport.ok) throw new Error(commentImport.diagnostics[0]?.message);
  expect(commentImport.comments[0]?.body).toEqual([
    {
      children: [{ bold: true, text: 'Rich comment' }],
      type: 'paragraph',
    },
  ]);
}, 60_000);

test('DOCX revision import keeps heavy work constant and sparse', async () => {
  const baseEditor = createEditor({
    plugins: [BaseParagraphPlugin],
    initialValue: [{ children: [{ text: 'seed' }], type: 'paragraph' }],
  });
  const base = await exportToDocx(baseEditor, {
    editorPlugins: [BaseParagraphPlugin],
    projection: 'proposed',
  });

  if (!base.ok) throw new Error(base.diagnostics[0]?.message);
  const baseBytes = await base.blob.arrayBuffer();
  const selected = process.env.DOCX_BENCHMARK_COHORT
    ? cohorts.filter(({ name }) => name === process.env.DOCX_BENCHMARK_COHORT)
    : cohorts;

  if (selected.length === 0) {
    throw new Error(
      `Unknown DOCX cohort ${process.env.DOCX_BENCHMARK_COHORT}.`
    );
  }
  const fixtures = await Promise.all(
    selected.map(async (cohort) => ({
      cohort,
      fixture: await buildFixture(baseBytes, cohort),
    }))
  );
  const spies: WorkSpies = {
    diff: spyOn(DocumentChange, 'between'),
    generate: spyOn(JSZip.prototype, 'generateAsync'),
    mammoth: spyOn(mammoth, 'convertToHtml'),
    parse: spyOn(DOMParser.prototype, 'parseFromString'),
  };
  const packageSource = readFileSync(
    new URL(
      '../../../packages/platejs/src/docx/internal/docxPackage.ts',
      import.meta.url
    ),
    'utf-8'
  );

  expect(packageSource.match(/new ZipReader\(/g)).toHaveLength(1);
  const rows = [];

  try {
    for (const { cohort, fixture } of fixtures) {
      const cold = await runMeasured(fixture, spies);

      await runMeasured(fixture, spies);
      const samples = [];

      for (let index = 0; index < cohort.samples; index++) {
        samples.push(await runMeasured(fixture, spies));
      }
      const durations = samples.map(({ durationMs }) => durationMs);
      const distribution = samples;
      const medianMs = percentile(durations, 0.5);
      const p95Ms = percentile(
        distribution.map(({ durationMs }) => durationMs),
        0.95
      );
      const maximumRssDelta = Math.max(
        ...distribution.map(({ rssDeltaBytes }) => rssDeltaBytes)
      );
      const p95HeapDelta = percentile(
        distribution.map(({ heapDeltaBytes }) => heapDeltaBytes),
        0.95
      );
      const p95RssDelta = percentile(
        distribution.map(({ rssDeltaBytes }) => rssDeltaBytes),
        0.95
      );

      expect(Math.max(...durations)).toBeLessThanOrEqual(cohort.maxMs);
      expect(p95Ms).toBeLessThanOrEqual(cohort.maxMs);
      expect(p95HeapDelta).toBeLessThanOrEqual(
        16 * MEBIBYTE + 4 * fixture.documentXmlBytes
      );
      rows.push({
        ...cohort,
        cold,
        compressedBytes: fixture.bytes.byteLength,
        expandedDocumentXmlBytes: fixture.documentXmlBytes,
        maximumRssDelta,
        medianMs,
        p95HeapDelta,
        p95Ms,
        p95RssDelta,
        samples,
      });
    }
  } finally {
    Object.values(spies).forEach((spy) => spy.mockRestore());
  }

  const result = {
    environment: {
      bun: Bun.version,
      platform: `${process.platform} ${process.arch}`,
    },
    frozenBaseline: Object.fromEntries(
      cohorts.map(({ baselineMedianMs, name }) => [name, baselineMedianMs])
    ),
    rows,
  };

  await mkdir(new URL('results/', import.meta.url), { recursive: true });
  await Bun.write(resultUrl, `${JSON.stringify(result, null, 2)}\n`);
}, 240_000);
