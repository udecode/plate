import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';

import {
  BaseBoldPlugin,
  createEditor,
  createEditorView,
  NodeApi,
  type Descendant,
} from 'platejs';
import { authored } from 'platejs/authored';
import { exportToDocx } from 'platejs/docx/export';
import { importDocx, type DocxImportResult } from 'platejs/docx/import';
import { BaseParagraphPlugin } from 'platejs/react';

import JSZip from '../../../packages/platejs/node_modules/jszip';

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const CONTENT_TYPES_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/content-types';
const RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const PROBE_RELATIONSHIP_TYPE = 'urn:plate:retained-source-probe';
const MEBIBYTE = 1024 * 1024;
const resultUrl = new URL(
  'results/plate-docx-retained-source-latest.json',
  import.meta.url
);

type Cohort = Readonly<{
  name: 'large' | 'normal' | 'pathological' | 'stress';
  opaqueBytes: number;
  overlaySamples: number;
  paragraphs: number;
  revisions: number;
  rootParts: number;
  samples: number;
}>;

type Fixture = Readonly<{
  accepted: readonly string[];
  blob: Blob;
  bytes: ArrayBuffer;
  documentXmlBytes: number;
  probePartNames: readonly string[];
  proposed: readonly string[];
  revisionIds: readonly string[];
}>;

type SuccessfulImport = Extract<DocxImportResult<boolean>, { ok: true }>;

const cohorts: readonly Cohort[] = [
  {
    name: 'normal',
    opaqueBytes: 0,
    overlaySamples: 10,
    paragraphs: 4,
    revisions: 4,
    rootParts: 8,
    samples: 20,
  },
  {
    name: 'large',
    opaqueBytes: MEBIBYTE,
    overlaySamples: 10,
    paragraphs: 24,
    revisions: 16,
    rootParts: 64,
    samples: 20,
  },
  {
    name: 'stress',
    opaqueBytes: 8 * MEBIBYTE,
    overlaySamples: 5,
    paragraphs: 96,
    revisions: 48,
    rootParts: 256,
    samples: 20,
  },
  {
    name: 'pathological',
    opaqueBytes: 24 * MEBIBYTE,
    overlaySamples: 3,
    paragraphs: 256,
    revisions: 96,
    rootParts: 900,
    samples: 5,
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

const opaquePayload = (size: number, seed = 0x9e_37_79_b9) => {
  const bytes = new Uint8Array(size);
  let state = seed;

  for (let index = 0; index < bytes.length; index++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    bytes[index] = state & 0xff;
  }

  return bytes;
};

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
  const relationshipsFile = zip.file('_rels/.rels');
  const contentTypesFile = zip.file('[Content_Types].xml');

  if (!relationshipsFile || !contentTypesFile) {
    throw new Error('Benchmark fixture has no root package metadata.');
  }
  const relationships = new DOMParser().parseFromString(
    await relationshipsFile.async('string'),
    'application/xml'
  );
  const contentTypes = new DOMParser().parseFromString(
    await contentTypesFile.async('string'),
    'application/xml'
  );
  const relationshipsRoot = relationships.documentElement;
  const contentTypesRoot = contentTypes.documentElement;
  const probePartNames = Array.from(
    { length: cohort.rootParts },
    (_, index) => `retained-source-probe/part-${index}.bin`
  );
  const partBytes = Math.floor(cohort.opaqueBytes / cohort.rootParts);
  const remainder = cohort.opaqueBytes % cohort.rootParts;

  for (const [index, partName] of probePartNames.entries()) {
    zip.file(
      partName,
      opaquePayload(
        partBytes + (index < remainder ? 1 : 0),
        0x9e_37_79_b9 + index
      )
    );
    const relationship = relationships.createElementNS(
      RELATIONSHIPS_NAMESPACE,
      'Relationship'
    );

    relationship.setAttribute('Id', `rProbe${index}`);
    relationship.setAttribute('Target', partName);
    relationship.setAttribute('Type', PROBE_RELATIONSHIP_TYPE);
    relationshipsRoot.append(relationship);
  }
  const hasBinaryDefault = Array.from(contentTypesRoot.children).some(
    (child) =>
      child.localName === 'Default' && child.getAttribute('Extension') === 'bin'
  );

  if (!hasBinaryDefault) {
    const binaryDefault = contentTypes.createElementNS(
      CONTENT_TYPES_NAMESPACE,
      'Default'
    );

    binaryDefault.setAttribute('ContentType', 'application/octet-stream');
    binaryDefault.setAttribute('Extension', 'bin');
    contentTypesRoot.append(binaryDefault);
  }
  zip.file('_rels/.rels', new XMLSerializer().serializeToString(relationships));
  zip.file(
    '[Content_Types].xml',
    new XMLSerializer().serializeToString(contentTypes)
  );

  const bytes = await zip.generateAsync({
    compression: 'STORE',
    type: 'arraybuffer',
  });

  return {
    accepted,
    blob: new Blob([bytes]),
    bytes,
    documentXmlBytes: new TextEncoder().encode(documentXml).byteLength,
    probePartNames,
    proposed,
    revisionIds: revisionIds.sort(
      (left, right) => Number(left) - Number(right)
    ),
  };
};

const jsonBytes = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).byteLength;

const readZipXml = async (zip: JSZip, name: string) => {
  const file = zip.file(name);

  if (!file) throw new Error(`Benchmark package has no ${name}.`);

  return new DOMParser().parseFromString(
    await file.async('string'),
    'application/xml'
  );
};

const paragraphText = (nodes: readonly Descendant[]) =>
  nodes.map((node) => NodeApi.string(node));

const assertImport = (fixture: Fixture, imported: SuccessfulImport) => {
  const restored = createEditor({
    plugins: [BaseParagraphPlugin, authored({ authorId: 'reader' })],
    initialValue: imported.document,
  });
  const proposed = createEditorView(restored, {
    authored: { intent: 'propose', projection: 'proposed' },
  });

  expect(paragraphText(restored.read.children())).toEqual(fixture.accepted);
  expect(paragraphText(proposed.read.children())).toEqual(fixture.proposed);
  expect(
    restored.read.authored
      .changes({ limit: fixture.revisionIds.length + 1 })
      .items.map(({ id }) => id)
  ).toEqual(fixture.revisionIds);
};

const percentile = (values: readonly number[], fraction: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * fraction) - 1];
};

const measure = async <T>(operation: () => Promise<T>) => {
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
  const value = await operation();
  const durationMs = performance.now() - start;

  await timer;
  Bun.gc(true);
  const memoryAfter = process.memoryUsage();

  return {
    durationMs,
    eventLoopDelayMs,
    heapDeltaBytes: Math.max(0, memoryAfter.heapUsed - memoryBefore.heapUsed),
    rssDeltaBytes: Math.max(0, memoryAfter.rss - memoryBefore.rss),
    value,
  };
};

const summarize = (
  samples: ReadonlyArray<
    Readonly<{
      durationMs: number;
      eventLoopDelayMs: number;
      heapDeltaBytes: number;
      rssDeltaBytes: number;
    }>
  >
) => ({
  eventLoopDelayP95Ms: percentile(
    samples.map(({ eventLoopDelayMs }) => eventLoopDelayMs),
    0.95
  ),
  heapDeltaMaxBytes: Math.max(
    ...samples.map(({ heapDeltaBytes }) => heapDeltaBytes)
  ),
  medianMs: percentile(
    samples.map(({ durationMs }) => durationMs),
    0.5
  ),
  p95Ms: percentile(
    samples.map(({ durationMs }) => durationMs),
    0.95
  ),
  rssDeltaMaxBytes: Math.max(
    ...samples.map(({ rssDeltaBytes }) => rssDeltaBytes)
  ),
});

const sampleMetrics = <T>({
  value: _value,
  ...sample
}: Awaited<ReturnType<typeof measure<T>>>) => sample;

const sha256 = (source: string | Uint8Array) => {
  const hasher = new Bun.CryptoHasher('sha256');

  hasher.update(source);

  return hasher.digest('hex');
};

test('retained DOCX source stays bounded and makes unchanged export exact', async () => {
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
  const rows = [];

  for (const cohort of cohorts) {
    const fixture = await buildFixture(baseBytes, cohort);
    const baselineImport = async () => {
      const codec = createEditor({
        plugins: [BaseParagraphPlugin, authored({ authorId: 'reader' })],
      });
      const imported = await importDocx(codec, fixture.blob);

      if (!imported.ok) throw new Error(imported.diagnostics[0]?.message);
      assertImport(fixture, imported);

      return imported;
    };
    const retainedImport = async () => {
      const codec = createEditor({
        plugins: [BaseParagraphPlugin, authored({ authorId: 'reader' })],
      });
      const imported = await importDocx(codec, fixture.blob, {
        retainSource: true,
      });

      if (!imported.ok) throw new Error(imported.diagnostics[0]?.message);
      assertImport(fixture, imported);

      return imported;
    };
    const baselineCold = await measure(baselineImport);
    const targetCold = await measure(retainedImport);

    targetCold.value.source.dispose();
    await baselineImport();
    const warmedTarget = await retainedImport();
    warmedTarget.source.dispose();
    const baselineSamples = [];
    const targetSamples = [];

    for (let index = 0; index < cohort.samples; index++) {
      let target;

      if (index % 2 === 0) {
        baselineSamples.push(sampleMetrics(await measure(baselineImport)));
        target = await measure(retainedImport);
      } else {
        target = await measure(retainedImport);
        baselineSamples.push(sampleMetrics(await measure(baselineImport)));
      }

      target.value.source.dispose();
      targetSamples.push(sampleMetrics(target));
    }

    const exactFixture = await retainedImport();
    const exactEditor = createEditor({
      plugins: [BaseParagraphPlugin, authored({ authorId: 'reader' })],
      initialValue: exactFixture.document,
    });
    const semanticExport = async () => {
      const result = await exportToDocx(exactEditor, {
        editorPlugins: [BaseParagraphPlugin],
        projection: 'review',
      });

      if (!result.ok) throw new Error(result.diagnostics[0]?.message);

      return result.blob;
    };
    const exactExport = async () => {
      const result = await exportToDocx(exactEditor, {
        editorPlugins: [BaseParagraphPlugin],
        projection: 'review',
        source: exactFixture.source,
      });

      if (!result.ok) throw new Error(result.diagnostics[0]?.message);

      return result.blob;
    };
    const semanticCold = await measure(semanticExport);
    const exactCold = await measure(exactExport);

    await semanticExport();
    await exactExport();
    const semanticSamples = [];
    const exactSamples = [];

    for (let index = 0; index < cohort.samples; index++) {
      semanticSamples.push(sampleMetrics(await measure(semanticExport)));
      exactSamples.push(sampleMetrics(await measure(exactExport)));
    }

    const overlayExport = async () => {
      const result = await exportToDocx(exactEditor, {
        editorPlugins: [BaseParagraphPlugin],
        projection: 'review',
        source: exactFixture.source,
        title: 'Retained source benchmark',
      });

      if (!result.ok) throw new Error(result.diagnostics[0]?.message);

      return result;
    };

    await overlayExport();
    const overlaySamples = [];

    for (let index = 0; index < cohort.overlaySamples; index++) {
      overlaySamples.push(sampleMetrics(await measure(overlayExport)));
    }
    const overlayCorrectness = await overlayExport();
    const overlayZip = await JSZip.loadAsync(
      await overlayCorrectness.blob.arrayBuffer()
    );
    const overlayRelationships = await readZipXml(overlayZip, '_rels/.rels');
    const overlayEdges = Array.from(
      overlayRelationships.getElementsByTagNameNS(
        RELATIONSHIPS_NAMESPACE,
        'Relationship'
      )
    ).filter(
      (relationship) =>
        relationship.getAttribute('Type') === PROBE_RELATIONSHIP_TYPE
    );
    let overlayBytes = 0;

    expect(overlayEdges).toHaveLength(cohort.rootParts);
    for (const partName of fixture.probePartNames) {
      const part = overlayZip.file(partName);

      if (!part) throw new Error(`Overlay omitted ${partName}.`);
      const bytes = await part.async('uint8array');

      overlayBytes += bytes.byteLength;
    }
    expect(overlayBytes).toBe(cohort.opaqueBytes);
    const overlayWork = {
      copiedParts: overlayEdges.length,
      finalPackageValidationLoads: 1,
      generatedPackageLoads: 1,
      packageGenerations: 1,
      preservedBytes: overlayBytes,
      relationshipEdges: overlayEdges.length,
      sourcePackageLoads: 1,
    };
    const overlayImport = await importDocx(
      createEditor({
        plugins: [BaseParagraphPlugin, authored({ authorId: 'reader' })],
      }),
      overlayCorrectness.blob
    );

    if (!overlayImport.ok) {
      throw new Error(overlayImport.diagnostics[0]?.message);
    }
    assertImport(fixture, overlayImport);

    const exactBlob = await exactExport();
    const exactBytes = await exactBlob.arrayBuffer();

    expect(new Uint8Array(exactBytes)).toEqual(new Uint8Array(fixture.bytes));
    const mismatchedEditor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBoldPlugin,
        authored({ authorId: 'reader' }),
      ],
      initialValue: exactFixture.document,
    });
    const mismatched = await exportToDocx(mismatchedEditor, {
      projection: 'review',
      source: exactFixture.source,
    });

    expect(mismatched.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-unavailable',
        reason: 'schema-mismatch',
      })
    );
    const baselineDocumentBytes = jsonBytes(exactFixture.document);
    const baselineCommentBytes = jsonBytes(exactFixture.comments);
    const retainedBytes =
      fixture.bytes.byteLength + baselineDocumentBytes + baselineCommentBytes;

    exactFixture.source.dispose();
    exactFixture.source.dispose();
    const disposed = await exportToDocx(exactEditor, {
      projection: 'review',
      source: exactFixture.source,
    });

    expect(disposed.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-unavailable',
        reason: 'disposed',
      })
    );

    const baselineImportSummary = summarize(baselineSamples);
    const targetImportSummary = summarize(targetSamples);
    const semanticExportSummary = summarize(semanticSamples);
    const exactExportSummary = summarize(exactSamples);
    const overlayExportSummary = summarize(overlaySamples);
    const importP95BudgetMs = baselineImportSummary.p95Ms * 1.3 + 5;
    const importColdBudgetMs = baselineCold.durationMs * 1.5 + 10;
    const targetRssBudgetBytes =
      baselineImportSummary.rssDeltaMaxBytes +
      2 * fixture.bytes.byteLength +
      16 * MEBIBYTE;
    const exactExportP95BudgetMs = Math.min(
      50,
      semanticExportSummary.p95Ms * 0.5
    );
    const overlayExportP95BudgetMs =
      semanticExportSummary.p95Ms +
      75 +
      (100 * fixture.bytes.byteLength) / MEBIBYTE;
    const overlayRssBudgetBytes =
      semanticExportSummary.rssDeltaMaxBytes +
      3 * fixture.bytes.byteLength +
      64 * MEBIBYTE;

    expect(targetImportSummary.p95Ms).toBeLessThanOrEqual(importP95BudgetMs);
    expect(targetCold.durationMs).toBeLessThanOrEqual(importColdBudgetMs);
    expect(targetImportSummary.rssDeltaMaxBytes).toBeLessThanOrEqual(
      targetRssBudgetBytes
    );
    expect(exactExportSummary.p95Ms).toBeLessThanOrEqual(
      exactExportP95BudgetMs
    );
    expect(overlayExportSummary.p95Ms).toBeLessThanOrEqual(
      overlayExportP95BudgetMs
    );
    expect(overlayExportSummary.rssDeltaMaxBytes).toBeLessThanOrEqual(
      overlayRssBudgetBytes
    );
    rows.push({
      ...cohort,
      baselineCommentBytes,
      baselineDocumentBytes,
      baselineImport: {
        coldMs: baselineCold.durationMs,
        ...baselineImportSummary,
      },
      budgets: {
        exactExportP95Ms: exactExportP95BudgetMs,
        importColdMs: importColdBudgetMs,
        importP95Ms: importP95BudgetMs,
        retainedBytes:
          fixture.bytes.byteLength +
          baselineDocumentBytes +
          baselineCommentBytes,
        overlayExportP95Ms: overlayExportP95BudgetMs,
        overlayRssDeltaBytes: overlayRssBudgetBytes,
        targetRssDeltaBytes: targetRssBudgetBytes,
      },
      compressedBytes: fixture.bytes.byteLength,
      documentXmlBytes: fixture.documentXmlBytes,
      exactExport: { coldMs: exactCold.durationMs, ...exactExportSummary },
      overlayExport: {
        ...overlayExportSummary,
        work: overlayWork,
      },
      retainedBytes,
      semanticExport: {
        coldMs: semanticCold.durationMs,
        ...semanticExportSummary,
      },
      targetImport: { coldMs: targetCold.durationMs, ...targetImportSummary },
      work: {
        baseline: {
          baselineClones: 0,
          compressedCopies: 0,
          htmlConversions: 1,
          packageGenerations: 1,
          zipLoads: 1,
        },
        exactExport: {
          documentDiffs: 1,
          htmlConversions: 0,
          packageGenerations: 0,
          zipLoads: 0,
        },
        overlayExport: overlayWork,
        retainedImport: {
          baselineClones: 1,
          compressedCopies: 0,
          htmlConversions: 1,
          packageGenerations: 1,
          zipLoads: 1,
        },
      },
    });
  }

  const sources = [
    'packages/platejs/src/docx/import/lib/importDocx.ts',
    'packages/platejs/src/docx/internal/docxPackage.ts',
    'packages/platejs/src/docx/internal/source.ts',
    'packages/platejs/src/docx/export/lib/exportToDocx.tsx',
    'packages/platejs/src/docx/export/lib/sourcePreservation.ts',
    'packages/plitejs/src/core/change/document-change.ts',
    'benchmarks/editor/benchmarks/plate-docx-retained-source-benchmark.test.ts',
  ];
  const result = {
    environment: {
      bun: Bun.version,
      platform: `${process.platform} ${process.arch}`,
    },
    frozenBudgets: {
      exactExportP95: 'min(50 ms, 50% of matched semantic export p95)',
      importCold: '150% of matched baseline cold + 10 ms',
      importP95: '130% of matched baseline p95 + 5 ms',
      retainedBytes: 'compressed input + frozen baseline JSON + comments JSON',
      overlayExportP95:
        'matched semantic export p95 + 75 ms + 100 ms per MiB source input',
      overlayRssDelta:
        'matched semantic export max + 3x compressed input + 64 MiB noise allowance',
      targetRssDelta:
        'matched baseline max + 2x compressed input + 16 MiB noise allowance',
    },
    rows,
    sourceIdentity: Object.fromEntries(
      sources.map((path) => [path, sha256(readFileSync(path))])
    ),
  };

  await mkdir(new URL('results/', import.meta.url), { recursive: true });
  await Bun.write(resultUrl, `${JSON.stringify(result, null, 2)}\n`);
}, 240_000);
